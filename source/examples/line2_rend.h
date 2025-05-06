#pragma once

#include <stdio.h>
#include <SDL3/SDL.h>
#include <glad/gl.h>
#include <cl/camera/cam3.h>
#include <cl/math/rand_r.h>
#include <cl/math/vec3_color_f.h>
#include <gl/shader.h>
#include <engine/renderers/sky_rend.h>
#include <engine/renderers/line2_rend.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

#include <engine/test/context.h>

const bool* keystate;

cam3_t cam;

sky_rdata_t sky;
line2_rdata_t line2_rdata;

void init() {
    keystate = SDL_GetKeyboardState(0);

    cam = cam3_new();

    sky_rend_init();

    // point renderer
    line2_rend_init();

    darr_t<line2_point_t>& points = line2_rdata.points;
    darr_new(points, 16);

    line2_point_t arrow_point;
    arrow_point.normal = {0.0f, 0.0f, 1.0f};
    arrow_point.color = frgb(255, 0, 0);
    arrow_point.size = 0.1f;

    arrow_point.position = {-4.0f, 4.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {-4.0f, 2.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {-6.0f, 0.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {-4.0f, -2.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {-4.0f, -4.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {-2.0f, -4.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {0.0f, -6.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {2.0f, -4.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {4.0f, -4.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {4.0f, -2.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {6.0f, 0.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {4.0f, 2.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {4.0f, 4.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {2.0f, 4.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {0.0f, 6.0f, 0.0f};
    darr_push(points, arrow_point);

    arrow_point.position = {-2.0f, 4.0f, 0.0f};
    darr_push(points, arrow_point);

    line2_rdata_build(line2_rdata);
}

void shut() {
    sky_rend_shut();

    line2_rdata_clear(line2_rdata);
    line2_rend_shut();
}

void process_event(SDL_Event& event) {
    if (event.type == SDL_EVENT_MOUSE_MOTION) {
        if (SDL_GetWindowRelativeMouseMode(context.window)) {
            cam3_pan(cam, event.motion.xrel);
            cam3_tilt(cam, event.motion.yrel);
        }
    }
}

void update() {
    if (SDL_GetWindowRelativeMouseMode(context.window)) {
        if (keystate[SDL_SCANCODE_A]) {
            cam3_move_right(cam, -1.0f);
        }

        if (keystate[SDL_SCANCODE_D]) {
            cam3_move_right(cam, 1.0f);
        }

        if (keystate[SDL_SCANCODE_S]) {
            cam3_move_forward(cam, -1.0f);
        }

        if (keystate[SDL_SCANCODE_W]) {
            cam3_move_forward(cam, 1.0f);
        }
    }

    cam3_fru(cam);
    cam3_compute_proj(cam, context.viewport_x, context.viewport_y);
    cam3_compute_view(cam);
}

void render() {
    sky_rend_render(sky, cam);
    line2_rend_render(line2_rdata, cam);
}

#include <engine/test/main.h>
