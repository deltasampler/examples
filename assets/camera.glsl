#type vertex
#version 460 core
uniform mat4 u_projection;
uniform mat4 u_view;
out vec2 v_tex_coord;

const vec2 positions[4] = vec2[](
    vec2(-1.0, -1.0),
    vec2(1.0, -1.0),
    vec2(-1.0, 1.0),
    vec2(1.0, 1.0)
);

const vec2 tex_coords[4] = vec2[](
    vec2(0.0, 0.0),
    vec2(1.0, 0.0),
    vec2(0.0, 1.0),
    vec2(1.0, 1.0)
);

void main() {
    gl_Position = u_projection * u_view * vec4(positions[gl_VertexID], 0.0, 1.0);
    v_tex_coord = tex_coords[gl_VertexID];
}

#type fragment
#version 460 core
precision mediump float;
out vec4 o_frag_color;
in vec2 v_tex_coord;

void main() {
    o_frag_color = vec4(v_tex_coord, 0.0, 1.0);
}
