import {vec2_t, vec3_t} from "@cl/type.ts";
import {cl_vec2, cl_vec2_dist, cl_vec2_set} from "@cl/vec2.ts";
import {d2_aabb2, d2_center_transform, d2_circle2, d2_clear_color, d2_fill_vec, d2_init, d2_line2, d2_line_radius2, d2_obb2, d2_polygon_cent2, d2_reset_transform, d2_stroke_vec} from "@engine/d2.ts";
import {io_init, io_m_move, m_event_t} from "@engine/io.ts";
import {point_closest_aabb, point_closest_capsule, point_closest_circle, point_closest_convex_cent, point_closest_line, point_closest_obb, point_inside_aabb, point_inside_capsule, point_inside_circle, point_inside_convex_cent, point_inside_obb} from "@cl/phys2.ts";
import {cl_vec3} from "@cl/vec3.ts";

document.body.style.height = "100vh";
document.body.style.margin = "0px";
document.body.style.overflow = "hidden";

const canvas_el = document.createElement("canvas");
document.body.append(canvas_el);
canvas_el.width = canvas_el.parentElement!.clientWidth;
canvas_el.height = canvas_el.parentElement!.clientHeight;

addEventListener("resize", function(): void {
    canvas_el.width = canvas_el.parentElement!.clientWidth;
    canvas_el.height = canvas_el.parentElement!.clientHeight;
});

const mouse = cl_vec2();

io_init();

io_m_move(function(event: m_event_t): void {
    if (event.target !== canvas_el) {
        return;
    }

    cl_vec2_set(mouse, event.x - canvas_el.width / 2.0, -event.y + canvas_el.height / 2.0);
});

d2_init(canvas_el);

interface collider_t {
    render(color: vec3_t): void;
    point_inside(point: vec2_t): boolean;
    rotate(angle: number): void;
    closest_point(point: vec2_t): vec2_t;
};

class circle_t implements collider_t {
    position: vec2_t;
    radius: number;

    constructor(position: vec2_t, radius: number) {
        this.position = position;
        this.radius = radius;
    }

    render(color: vec3_t): void {
        d2_fill_vec(color);
        d2_circle2(this.position, this.radius);
    }

    point_inside(point: vec2_t): boolean {
        return point_inside_circle(this.position, this.radius, point);
    }

    closest_point(point: vec2_t): vec2_t {
        return point_closest_circle(this.position, this.radius, point);
    }

    rotate(angle: number): void {
        return;
    }
}

class aabb_t implements collider_t {
    position: vec2_t;
    size: vec2_t;

    constructor(position: vec2_t, size: vec2_t) {
        this.position = position;
        this.size = size;
    }

    render(color: vec3_t): void {
        d2_fill_vec(color);
        d2_aabb2(this.position, this.size);
    }

    point_inside(point: vec2_t): boolean {
        return point_inside_aabb(this.position, this.size, point);
    }

    closest_point(point: vec2_t): vec2_t {
        return point_closest_aabb(this.position, this.size, point);
    }

    rotate(angle: number): void {
        return;
    }
}

class obb_t implements collider_t {
    position: vec2_t;
    size: vec2_t;
    angle: number;

    constructor(position: vec2_t, size: vec2_t, angle: number) {
        this.position = position;
        this.size = size;
        this.angle = angle;
    }

    render(color: vec3_t): void {
        d2_fill_vec(color);
        d2_obb2(this.position, this.size, this.angle);
    }

    point_inside(point: vec2_t): boolean {
        return point_inside_obb(this.position, this.size, this.angle, point);
    }

    closest_point(point: vec2_t): vec2_t {
        return point_closest_obb(this.position, this.size, this.angle, point);
    }

    rotate(angle: number): void {
        this.angle += angle;
    }
}

class capsule_t implements collider_t {
    start: vec2_t;
    end: vec2_t;
    radius: number;

    constructor(start: vec2_t, end: vec2_t, radius: number) {
        this.start = start;
        this.end = end;
        this.radius = radius;
    }

    render(color: vec3_t): void {
        d2_fill_vec(color);
        d2_line_radius2(this.start, this.end, this.radius);
    }

    point_inside(point: vec2_t): boolean {
        return point_inside_capsule(this.start, this.end, this.radius, point);
    }

    closest_point(point: vec2_t): vec2_t {
        return point_closest_capsule(this.start, this.end, this.radius, point);
    }

    rotate(angle: number): void {
        return;
    }
}

class line_t implements collider_t {
    start: vec2_t;
    end: vec2_t;

    constructor(start: vec2_t, end: vec2_t) {
        this.start = start;
        this.end = end;
    }

    render(color: vec3_t): void {
        d2_stroke_vec(color, 1.0);
        d2_line2(this.start, this.end);
    }

    point_inside(point: vec2_t): boolean {
        return cl_vec2_dist(point_closest_line(this.start, this.end, point), point) <= 1.0;
    }

    closest_point(point: vec2_t): vec2_t {
        return point_closest_line(this.start, this.end, point);
    }

    rotate(angle: number): void {
        return;
    }
}

function center_points(points: vec2_t[]): vec2_t {
    let cx = 0.0, cy = 0.0;
    let area = 0.0;

    for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const x0 = curr[0], y0 = curr[1];
        const x1 = next[0], y1 = next[1];
        const cross = x0 * y1 - x1 * y0;

        cx += (x0 + x1) * cross;
        cy += (y0 + y1) * cross;
        area += cross;
    }

    area *= 0.5;
    cx /= (6 * area);
    cy /= (6 * area);

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        point[0] -= cx;
        point[1] -= cy;
    }

    return cl_vec2(cx, cy);
}

class polygon_t implements collider_t {
    points: vec2_t[];
    center: vec2_t;
    position: vec2_t;
    angle: number;

    constructor(points: vec2_t[], position: vec2_t, angle: number) {
        this.points = points;
        this.center = center_points(this.points);
        this.position = position;
        this.angle = angle;
    }

    render(color: vec3_t): void {
        d2_fill_vec(color);
        d2_polygon_cent2(this.points, this.position, this.angle);
    }

    point_inside(point: vec2_t): boolean {
        return point_inside_convex_cent(this.points, this.position, this.angle, point);
    }

    closest_point(point: vec2_t): vec2_t {
        return point_closest_convex_cent(this.points, this.position, this.angle, point);
    }

    rotate(angle: number): void {
        this.angle += angle;
    }
}

const colliders: collider_t[] = [];
colliders.push(new circle_t(cl_vec2(0.0), 50.0));
colliders.push(new aabb_t(cl_vec2(200.0, 10.0), cl_vec2(120.0)));
colliders.push(new obb_t(cl_vec2(-200.0, 10.0), cl_vec2(80.0, 160.0), 90.0));
colliders.push(new capsule_t(cl_vec2(-200.0, 200.0), cl_vec2(200.0, 400.0), 30.0));
colliders.push(new line_t(cl_vec2(-200.0, -200.0), cl_vec2(100.0, -400.0)));
colliders.push(new polygon_t([cl_vec2(-100.0, -86.6), cl_vec2(100.0, -86.6), cl_vec2(0.0, 86.6)], cl_vec2(200.0, -200.0), 0.0));
colliders.push(new polygon_t([cl_vec2(100.0, 0.0), cl_vec2(50.0, 86.6), cl_vec2(-50.0, 86.6), cl_vec2(-100.0, 0.0), cl_vec2(-50.0, -86.6), cl_vec2(50.0, -86.6)], cl_vec2(-500.0, -200.0), 0.0));

function update(): void {
    for (const collider of colliders) {
        collider.rotate(0.001);
    }
}

function render(): void {
    d2_reset_transform();
    d2_clear_color(184, 242, 255);
    d2_center_transform();

    for (const collider of colliders) {
        if (collider.point_inside(mouse)) {
            collider.render(cl_vec3(227, 227, 227));
        } else {
            collider.render(cl_vec3(209, 209, 209));
        }
    }

    for (const collider of colliders) {
        const cp = collider.closest_point(mouse);

        if (cl_vec2_dist(cp, mouse) <= 100.0) {
            d2_stroke_vec(cl_vec3(255, 120, 120), 4.0);
            d2_line2(cp, mouse);

            d2_fill_vec(cl_vec3(255, 120, 120));
            d2_circle2(cp, 4.0);
        }
    }
}

function loop(): void {
    update();
    render();

    requestAnimationFrame(loop);
}

loop();
