#pragma once

#include <stdio.h>
#include <SDL3/SDL.h>
#include <glad/gl.h>
#include <cl/camera/cam3.h>
#include <cl/math/rand_r.h>
#include <cl/math/vec3_color_f.h>
#include <gl/shader.h>
#include <engine/renderers/sky_rend.h>
#include <engine/renderers/point_rend.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

#include <engine/test/context.h>

const bool* keystate;

cam3_t cam;

sky_rdata_t sky;
point_rdata_t point_rdata;

void init() {
    keystate = SDL_GetKeyboardState(0);

    cam = cam3_new();

    sky_rend_init();

    // point renderer
    point_rend_init();

    darr_t<point_t>& points = point_rdata.points;
    darr_new(points, 1024);

    for (usize i = 0; i < points.cap; i += 1) {
        darr_push(points, {
            fvec3(rand_in(-50.0f, 50.0f), rand_in(-50.0f, 50.0f), rand_in(-50.0f, 50.0f)),
            rand_in(1.0f, 2.0f),
            fvec3(frand(), frand(), frand())
        });
    }

    point_rdata_build(point_rdata);
}

void shut() {
    sky_rend_shut();

    point_rdata_clear(point_rdata);
    point_rend_shut();
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
    point_rend_render(point_rdata, cam);
}

#include <engine/test/main.h>
