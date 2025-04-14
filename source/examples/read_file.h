#include <stdio.h>
#include <stdlib.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

int32_t main(int32_t, char**) {
    FILE* file = fopen(ROOT_PATH"assets/test.txt", "r");
    char* line = nullptr;
    size_t len = 0;

    if (file == nullptr) {
        return -1;
    }

    while (getline(&line, &len, file) != -1) {
        printf("%s", line);
    }

    fclose(file);

    if (line) {
        free(line);
    }

    return 0;
}
