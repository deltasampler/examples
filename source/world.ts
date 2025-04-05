import {cam2_compute_proj, cam2_compute_view, cam2_move_right, cam2_move_up, cam2_new, cam2_zoom} from "@cl/cam2.ts";
import {obb_rdata_build, obb_rdata_instance, obb_rdata_new, obb_rend_build, obb_rend_init, obb_rend_render} from "@engine/obb_rend.ts";
import {io_init, io_key_down} from "@engine/io.ts";
import {create_canvas} from "@engine/canvas.ts";
import {gl_init} from "@engine/gl.ts";
import {vec2, vec2_copy, vec2_muls1, vec2_set} from "@cl/vec2.ts";
import {rand_in} from "@cl/math.ts";
import {vec4} from "@cl/vec4.ts";
import {circle_rdata_build, circle_rdata_instance, circle_rdata_new, circle_rend_build, circle_rend_init, circle_rend_render} from "@engine/circle_rend.ts";

export class transform_t {
    translation: vec2_t;
    rotation: number;
    scaling: vec2_t;
};

export function transform_new(): transform_t {
    const transform = new transform_t();
    transform.translation = vec2();
    transform.rotation = 0.0;
    transform.scaling = vec2(1.0);

    return transform;
}

export enum GEOMETRY_TYPE {
    CIRCLE,
    BOX,
    POLYGON
};

export class geometry_t {
    type: GEOMETRY_TYPE;
    extent: vec2_t;
    vertices: vec2_t[];
};

export function geometry_new(): geometry_t {
    const geometry = new geometry_t();
    geometry.type = GEOMETRY_TYPE.CIRCLE;
    geometry.extent = vec2(1.0);
    geometry.vertices = [];

    return geometry;
};

export class body_t {
    mass: number;
    force: vec2_t;
    acceleration: vec2_t;
    velocity: vec2_t;
    damping: number;
    friction: number;
    restitution: number;
    collision_flag: boolean;
    dynamic_flag: boolean;
};

export function body_new(): body_t {
    const body = new body_t();
    body.mass = 1.0;
    body.force = vec2();
    body.acceleration = vec2();
    body.velocity = vec2();
    body.damping = 1.0;
    body.friction = 1.0;
    body.restitution = 1.0;
    body.collision_flag = true;
    body.dynamic_flag = false;

    return body;
};

export class enitity_t {
    transform: transform_t;
    geometry: geometry_t;
    body: body_t;
};

export function entity_new(): enitity_t {
    const entity = new enitity_t();
    entity.transform = transform_new();
    entity.geometry = geometry_new();
    entity.body = body_new();

    return entity;
};

export class level_t {
    entities: enitity_t[];
};

export function level_new(): level_t {
    const level = new level_t();
    level.entities = [];

    return level;
}

export function level_add_entity(level: level_t, entity: enitity_t): void {
    level.entities.push(entity);
}

export function level_remove_entity(level: level_t, entity: enitity_t): void {
    const index = level.entities.indexOf(entity);

    if (index < 0) {
        return;
    }

    level.entities.splice(index, 1);
}

const canvas_el = create_canvas(document.body);
const gl = gl_init(canvas_el);
const camera = cam2_new();
const level = level_new();

for (let i = 0; i < 32; i += 1) {
    const box = entity_new();

    vec2_set(box.transform.translation, rand_in(-16.0, 16.0), rand_in(-16.0, 16.0));

    if (Math.random() > 0.5) {
        box.geometry.type = GEOMETRY_TYPE.BOX;
    }

    vec2_copy(box.geometry.extent, vec2(rand_in(0.5, 2.0)));

    level_add_entity(level, box);
}

const circles = [];
const boxes = [];

for (const entity of level.entities) {
    if (entity.geometry.type === GEOMETRY_TYPE.BOX) {
        boxes.push(entity);
    } else if (entity.geometry.type === GEOMETRY_TYPE.CIRCLE) {
        circles.push(entity);
    }
}

const circle_rdata = circle_rdata_new();
circle_rdata_build(circle_rdata, circles.length);

for (let i = 0; i < circles.length; i += 1) {
    const circle = circles[i];
    const transform = circle.transform;
    const geometry = circle.geometry;

    circle_rdata_instance(circle_rdata, i, transform.translation, geometry.extent[0], 0, vec4(0, 0, 0, 255), vec4(255), 0.1);
}

circle_rend_init();
circle_rend_build(circle_rdata);

const obb_rdata = obb_rdata_new();
obb_rdata_build(obb_rdata, boxes.length);

for (let i = 0; i < boxes.length; i += 1) {
    const box = boxes[i];
    const transform = box.transform;
    const geometry = box.geometry;

    obb_rdata_instance(obb_rdata, i, transform.translation, vec2_muls1(geometry.extent, 2.0), 0, 0, vec4(0, 0, 0, 255), vec4(255), 0.1);
}

obb_rend_init();
obb_rend_build(obb_rdata);

function update(): void {
    if (io_key_down("KeyA")) {
        cam2_move_right(camera, -1.0);
    }

    if (io_key_down("KeyD")) {
        cam2_move_right(camera, 1.0);
    }

    if (io_key_down("KeyS")) {
        cam2_move_up(camera, -1.0);
    }

    if (io_key_down("KeyW")) {
        cam2_move_up(camera, 1.0);
    }

    if (io_key_down("KeyQ")) {
        cam2_zoom(camera, -1.0);
    }

    if (io_key_down("KeyE")) {
        cam2_zoom(camera, 1.0);
    }

    cam2_compute_proj(camera, canvas_el.width, canvas_el.height);
    cam2_compute_view(camera);
}

function render(): void {
    gl.viewport(0, 0, canvas_el.width, canvas_el.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    circle_rend_render(circle_rdata, camera);
    obb_rend_render(obb_rdata, camera);
}

function loop(): void {
    update();
    render();

    requestAnimationFrame(loop);
}

io_init();

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.CULL_FACE);

loop();
