#pragma once

#include <stdio.h>
#include <SDL3/SDL.h>
#include <glad/gl.h>
#include <cl/camera/cam3.h>
#include <cl/math/rand_r.h>
#include <cl/math/vec3_color_f.h>
#include <gl/shader.h>
#include <engine/renderers/ray_marcher.h>
#include <imgui/imgui.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

#include <engine/test/context.h>

const bool* keystate;

cam3_t cam;


void init() {
    keystate = SDL_GetKeyboardState(0);

    cam = cam3_new();
    cam.movement_speed = 0.001f;
    cam.near = 0.00001f;
    cam.far = 32.0f;
    cam.position.y = 15.0f;

    ray_marcher_init(960, 540);
}

void shut() {
    ray_marcher_shut();
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

    ray_marcher_update(cam);
}

void render() {
    ray_marcher_render(cam);
}

void gui() {

}

#define USE_IMGUI
#include <engine/test/main.h>
