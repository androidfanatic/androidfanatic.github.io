// src: https://rosettacode.org/wiki/Maze_generation#JavaScript

function buildMaze(x, y) {
    var n = x * y - 1;
    if (n < 0) {
        alert("illegal maze dimensions");
        return;
    }
    var horiz = [];
    for (var j = 0; j < x + 1; j++) horiz[j] = [],
        verti = [];
    for (var j = 0; j < x + 1; j++) verti[j] = [],
        here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)],
        path = [here],
        unvisited = [];
    for (var j = 0; j < x + 2; j++) {
        unvisited[j] = [];
        for (var k = 0; k < y + 1; k++)
            unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1));
    }
    while (0 < n) {
        var potential = [
            [here[0] + 1, here[1]],
            [here[0], here[1] + 1],
            [here[0] - 1, here[1]],
            [here[0], here[1] - 1]
        ];
        var neighbors = [];
        for (var j = 0; j < 4; j++)
            if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
                neighbors.push(potential[j]);
        if (neighbors.length) {
            n = n - 1;
            next = neighbors[Math.floor(Math.random() * neighbors.length)];
            unvisited[next[0] + 1][next[1] + 1] = false;
            if (next[0] == here[0])
                horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
            else
                verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
            path.push(here = next);
        } else
            here = path.pop();
    }
    return {
        x: x,
        y: y,
        horiz: horiz,
        verti: verti
    };
}

// 0 = no block
// 1 = corner block
// 2 = horizontal block
// 3 = vertical block
function getMazeBlocks(m) {
    var rows = [];
    for (var j = 0; j < m.x * 2 + 1; j++) {
        var row = [];
        if (0 == j % 2)
            for (var k = 0; k < m.y * 4 + 1; k++)
                if (0 == k % 4)
                    row[k] = 1;
                else
        if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)])
            row[k] = 0;
        else
            row[k] = 2;
        else
            for (var k = 0; k < m.y * 4 + 1; k++)
                if (0 == k % 4)
                    if (k > 0 && m.horiz[(j - 1) / 2][k / 4 - 1])
                        row[k] = 0;
                    else
                        row[k] = 3;
        else
            row[k] = 0;
        if (0 == j) row[1] = row[2] = row[3] = 0;
        if (m.x * 2 - 1 == j) row[4 * m.y] = 0;
        rows.push(row);
    }
    return rows;
}

function addWall(x, y, z, h, w, d) {
    var wall = document.createElement('a-entity');
    wall.setAttribute("position", x + " " + y + " " + z);
    wall.setAttribute("geometry", "height:" + h + ";width:" + w + ";depth:" + d + ";");
    wall.setAttribute("material", "src: #wall");
    wall.setAttribute("static-body", "shape: box;");
    document.querySelector('a-scene').appendChild(wall);
}

function renderMaze() {

    var mx = 6;
    var my = 6;

    // generate maze
    var maze = buildMaze(mx, my);

    // get block positions, each cell is 5 units wide
    var rows = getMazeBlocks(maze);

    var cw = 5; // each cell is 5 units wide

    var u = 1; // width & height of a block
    var h = 4; // height of block

    // start x, z position
    var x = 0;
    var z = -(my - 1) / 2 * u * cw;

    // update ground location
    var grid = document.querySelector('a-grid');
    grid.setAttribute('width', (mx - 1) * u * cw);
    grid.setAttribute('height', (my - 1) * u * cw);

    // start placing blocks
    for (var p = 0; p < rows.length; p++) {
        x = -(mx - 1) / 2 * u * cw;
        var row = rows[p];
        for (var q = 0; q < row.length; q++) {
            switch (row[q]) {
                case 0:
                    break;
                case 1:
                    addWall(x, h / 2, z, h, u, u);
                    break;
                case 2:
                    addWall(x, h / 2, z, h, u, u);
                    break;
                case 3:
                    addWall(x, h / 2, z, h, u, u * 3);
                    break;
            }
            x += u;
        }
        z += 2 * u;
    }
}

window.addEventListener('load', function() {
    renderMaze();
});