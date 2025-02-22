import {gl_init, gl_link_program} from "@engine/gl.ts";

document.body.style.margin = "0";
document.body.style.height = "100vh";
document.body.style.overflow = "hidden";

const canvas_el = document.createElement("canvas");
canvas_el.width = document.body.clientWidth;
canvas_el.height = document.body.clientHeight;
document.body.append(canvas_el);

addEventListener("resize", function(): void {
    canvas_el.width = document.body.clientWidth;
    canvas_el.height = document.body.clientHeight;
});

const gl = gl_init(canvas_el);

const program_main = gl_link_program({
    [gl.VERTEX_SHADER]: `#version 300 es
        layout(location = 0) in vec2 i_position;
        layout(location = 1) in vec2 i_tex_coord;
        out vec2 v_tex_coord;
        uniform float u_scale_x;
        uniform float u_scale_y;

        void main() {
            gl_Position = vec4(i_position * vec2(u_scale_x, u_scale_y), 0.0, 1.0);
            v_tex_coord = i_tex_coord;
        }
    `,
    [gl.FRAGMENT_SHADER]: `#version 300 es
        precision highp float;
        in vec2 v_tex_coord;
        out vec4 o_frag_color;
        uniform sampler2D u_texture;

        void main() {
            o_frag_color = texture(u_texture, v_tex_coord);
        }
    `
}) as WebGLProgram;

const u_scale_x = gl.getUniformLocation(program_main, "u_scale_x");
const u_scale_y = gl.getUniformLocation(program_main, "u_scale_y");

const vertices = [
    -1.0, 1.0, 0.0, 0.0,
    -1.0, -1.0, 0.0, 1.0,
    1.0, -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 0.0
];

const indices = [
    0, 1, 2,
    0, 2, 3
];

const index_count = indices.length;

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);

gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

const ibo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

const texture_width = 512;
const texture_height = 512;
const channels = 3;
const size = texture_width * texture_height * channels;
const texture_data = new Uint8Array(size);

for (let y = 0; y < texture_height; ++y) {
    for (let x = 0; x < texture_height; ++x) {
        const i = index(x, y, texture_width) * channels;
        texture_data[i] = 255;
        texture_data[i + 1] = 255;
        texture_data[i + 2] = 255;
    }
}

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texture_width, texture_height, 0, gl.RGB, gl.UNSIGNED_BYTE, texture_data);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

function rand_ex(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}

function index(x: number, y: number, width: number): number {
    return y * width + x;
}

function cycle(x: number, l: number): number {
    return (x + l) % l;
}

const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
];

class ant_t {
    x: number;
    y: number;
    dir: number;
};

const ant = new ant_t();
ant.x = rand_ex(0, texture_width);
ant.y = rand_ex(0, texture_height);
ant.dir = 0;

function render(): void {
    const canvas_size = Math.min(canvas_el.width, canvas_el.height);

    for (let i = 0; i < 100; i += 1) {
        const i = index(ant.x, ant.y, texture_width) * channels;
        const value = texture_data[i];

        if (!value) {
            ant.dir = cycle(ant.dir + 1, dirs.length);
            texture_data[i] = 255;
            texture_data[i + 1] = 255;
            texture_data[i + 2] = 255;
        } else {
            ant.dir = cycle(ant.dir - 1, dirs.length);
            texture_data[i] = 0;
            texture_data[i + 1] = 0;
            texture_data[i + 2] = 0;
        }

        const dir = dirs[ant.dir];
        ant.x = cycle(ant.x + dir[0], texture_width);
        ant.y = cycle(ant.y + dir[1], texture_height);
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texture_width, texture_height, 0, gl.RGB, gl.UNSIGNED_BYTE, texture_data);

    gl.viewport(0, 0, canvas_el.width, canvas_el.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program_main);
    gl.uniform1f(u_scale_x, canvas_size / canvas_el.width);
    gl.uniform1f(u_scale_y, canvas_size / canvas_el.height);
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, index_count, gl.UNSIGNED_INT, 0);
}

function loop(): void {
    render();

    requestAnimationFrame(loop);
}

loop();
