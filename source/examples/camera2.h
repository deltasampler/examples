#include <stdio.h>
#include <SDL3/SDL.h>
#include <glad/gl.h>
#include <gl/shader.h>
#include <cl/types.h>
#include <cl/camera/cam2.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

s32 main() {
    if (!SDL_Init(SDL_INIT_VIDEO | SDL_INIT_GAMEPAD)) {
        printf("ERROR: SDL_Init(): %s\n", SDL_GetError());

        return -1;
    }

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_FLAGS, 0);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 6);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);
    SDL_GL_SetAttribute(SDL_GL_STENCIL_SIZE, 8);

    u32 window_flags = SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIDDEN;
    SDL_Window* window = SDL_CreateWindow("Project", 1280, 720, window_flags);

    if (window == nullptr) {
        printf("ERROR: SDL_CreateWindow(): %s\n", SDL_GetError());

        return -1;
    }

    SDL_SetWindowPosition(window, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED);
    SDL_GLContext gl_context = SDL_GL_CreateContext(window);

    if (gl_context == nullptr) {
        printf("ERROR: SDL_GL_CreateContext(): %s\n", SDL_GetError());

        return -1;
    }

    SDL_GL_MakeCurrent(window, gl_context);
    SDL_GL_SetSwapInterval(1);
    SDL_ShowWindow(window);

    if (gladLoadGL(GLADloadfunc(SDL_GL_GetProcAddress)) == 0) {
        printf("ERROR: gladLoadGL()\n");

        return -1;
    }

    bool done = false;
    s32 w, h;
    SDL_GetWindowSize(window, &w, &h);

    u32 program = program_load(ROOT_PATH"assets/shaders/camera.glsl");
    s32 u_projection = glGetUniformLocation(program, "u_projection");
    s32 u_view = glGetUniformLocation(program, "u_view");

    u32 vao;
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    cam2_t cam = cam2_new();
    const bool* keystate = SDL_GetKeyboardState(0);

    while (!done) {
        SDL_Event event;

        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_EVENT_WINDOW_RESIZED && event.window.windowID == SDL_GetWindowID(window)) {
                SDL_GetWindowSize(window, &w, &h);
            }

            if (event.type == SDL_EVENT_QUIT) {
                done = true;
            }

            if (event.type == SDL_EVENT_WINDOW_CLOSE_REQUESTED && event.window.windowID == SDL_GetWindowID(window)) {
                done = true;
            }
        }

        if (SDL_GetWindowFlags(window) & SDL_WINDOW_MINIMIZED) {
            SDL_Delay(10);

            continue;
        }

        if (keystate[SDL_SCANCODE_A]) {
            cam2_move_right(cam, -1.0f);
        }

        if (keystate[SDL_SCANCODE_D]) {
            cam2_move_right(cam, 1.0f);
        }

        if (keystate[SDL_SCANCODE_S]) {
            cam2_move_up(cam, -1.0f);
        }

        if (keystate[SDL_SCANCODE_W]) {
            cam2_move_up(cam, 1.0f);
        }

        cam2_compute_proj(cam, w, h);
        cam2_compute_view(cam);

        glViewport(0, 0, w, h);
        glClearColor(0.5f, 0.5f, 0.5f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glUseProgram(program);
        glUniformMatrix4fv(u_projection, 1, false, cam.projection.arr);
        glUniformMatrix4fv(u_view, 1, false, cam.view.arr);
        glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        SDL_GL_SwapWindow(window);
    }

    glDeleteProgram(program);

    glBindVertexArray(0);
    glDeleteVertexArrays(1, &vao);

    SDL_GL_DestroyContext(gl_context);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
