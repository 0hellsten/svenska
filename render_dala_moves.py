"""Render Wilawan's painted puppet into transparent, 24 fps frame atlases."""

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
FRAME = 384
FPS = 24
COLUMNS = 6
SUPERSAMPLE = 1.5

# Source-art coordinates. Move the upper and lower limbs around different joints.
LIMBS = (
    ("far_front", (179, 412), (171, 530),
     [(110, 386), (180, 386), (181, 432), (211, 464), (217, 532), (211, 671), (110, 671)]),
    ("far_back", (435, 420), (459, 525),
     [(385, 405), (471, 410), (503, 505), (507, 658), (399, 658), (403, 519)]),
    ("front", (267, 407), (270, 523),
     [(190, 371), (331, 369), (368, 445), (347, 491), (320, 555), (318, 680),
      (209, 680), (212, 555), (210, 489), (194, 450), (174, 424)]),
    ("back", (567, 414), (566, 524),
     [(509, 379), (605, 373), (629, 480), (639, 670), (518, 673),
      (506, 576), (487, 509), (474, 458)]),
)
HEAD_JOINT = (264, 272)
TAIL_JOINT = (575, 260)
GROUND_JOINT = (570, 638)

# time, x, y, pitch, squash, neck, front shoulder/knee,
# far front shoulder/knee, hind hip/hock, far hind hip/hock, tail
REST = (0,) * 14
MOVES = {
    "wave": (1.54, [
        (0, *REST),
        (.16, 4, 5, -2, .02, -4, 12, -13, 0, 0, 0, 0, 0, 0, 6),
        (.36, 6, -2, 3, -.02, 7, 61, -49, -2, 0, 0, 0, 0, 0, -5),
        (.48, 5, 0, 1, 0, 2, 54, -65, -2, 0, 0, 0, 0, 0, -8),
        (.64, 6, -2, 3, 0, 6, 62, -47, 0, 0, 0, 0, 0, 0, 3),
        (.83, -2, 4, -2, .025, -3, 8, -10, 0, 0, 0, 0, 0, 0, 6),
        (1, *REST),
    ]),
    "rear": (1.92, [
        (0, *REST),
        (.15, 5, 15, -5, .055, -7, -6, -7, -5, 0, 7, -10, 6, -8, -5),
        (.33, -37, 0, 27, -.018, 9, 24, -66, 12, -57, 2, -2, -3, 5, -15),
        (.46, -89, -5, 40, -.02, 10, 37, -71, 22, -65, -5, 10, -4, 12, -20),
        (.58, -78, -1, 38, 0, 3, 22, -40, 35, -69, -3, 7, -5, 12, -9),
        (.69, -49, -1, 32, 0, 6, 30, -58, 20, -43, -3, 8, -2, 6, 1),
        (.84, -4, 7, 10, .035, -8, 12, -8, 5, -12, 2, 0, 1, 0, 12),
        (.91, 0, 10, -3, .055, -8, 4, -7, 4, -7, 3, -5, 1, -5, 8),
        (1, *REST),
    ]),
    "jump": (1.75, [
        (0, *REST),
        (.15, 23, 14, -4, .06, -7, -7, -15, -5, -9, 14, -26, 11, -19, -7),
        (.29, 19, -38, 13, -.025, 2, 31, -67, 24, -62, -23, 26, -22, 27, -12),
        (.46, -28, -98, 4, -.025, 9, 35, -75, 24, -68, 24, -51, 24, -42, -21),
        (.60, -62, -60, -7, 0, -2, 22, -23, 15, -16, 23, -28, 13, -33, -12),
        (.74, -73, 12, -7, .07, -8, 11, -6, 9, -5, 5, -9, 4, -11, 10),
        (.87, -54, 3, 1, .015, 4, -6, -11, 12, -21, -7, 3, 10, -8, 6),
        (1, *REST),
    ]),
    "bow": (1.90, [
        (0, *REST),
        (.17, 0, -2, 4, 0, 8, 5, -7, -4, 0, 0, 0, 0, 0, -5),
        (.42, 6, 5, -13, .05, -24, 43, -76, 35, -67, 0, 3, -4, 4, 10),
        (.60, 6, 5, -14, .05, -25, 44, -79, 33, -65, 0, 4, -4, 4, 10),
        (.83, -1, 3, -4, .012, -6, 5, -13, 7, -14, 0, 0, 0, 0, 2),
        (1, *REST),
    ]),
}


def smooth(value):
    t = np.clip(value, 0, 1)
    return t * t * (3 - 2 * t)


def shift(x, y):
    return np.array([[1., 0., x], [0., 1., y], [0., 0., 1.]])


def rotate(angle, pivot):
    c = math.cos(math.radians(angle))
    s = math.sin(math.radians(angle))
    x, y = pivot
    return shift(x, y) @ np.array([[c, -s, 0.], [s, c, 0.], [0., 0., 1.]]) @ shift(-x, -y)


def interpolate(points, time):
    index = min(np.searchsorted(points[:, 0], time, side="right") - 1, len(points) - 2)
    t0, *a = points[index]
    t1, *b = points[index + 1]
    start, end = np.array(a), np.array(b)
    delta = t1 - t0
    t = (time - t0) / delta
    previous = points[max(0, index - 1)]
    following = points[min(len(points) - 1, index + 2)]
    m0 = (end - previous[1:]) / (t1 - previous[0])
    m1 = (following[1:] - start) / (following[0] - t0)
    direction = end - start
    m0 = np.where((start - previous[1:]) * direction > 0, m0, 0)
    m1 = np.where((following[1:] - end) * direction > 0, m1, 0)
    result = ((2 * t**3 - 3 * t**2 + 1) * start + (t**3 - 2 * t**2 + t) * delta * m0
              + (-2 * t**3 + 3 * t**2) * end + (t**3 - t**2) * delta * m1)
    return np.clip(result, np.minimum(start, end), np.maximum(start, end))


def polygon(size, points):
    layer = Image.new("L", size)
    ImageDraw.Draw(layer).polygon(points, fill=255)
    return np.asarray(layer.filter(ImageFilter.GaussianBlur(.6)), dtype=float) / 255


def masked(image, opacity):
    layer = image.copy()
    layer.putalpha(Image.fromarray(np.rint(np.asarray(image.getchannel("A")) * opacity).astype("uint8")))
    return layer


class DalaPuppet:
    def __init__(self, image):
        self.image = image
        height, width = image.height, image.width
        y, x = np.ogrid[:height, :width]
        self.parts = {}
        cut = np.zeros((height, width), dtype=float)
        for name, shoulder, knee, outline in LIMBS:
            mask = polygon(image.size, outline)
            top = 1 - smooth((y - knee[1] - 3) / 19)
            lower = smooth((y - knee[1] + 20) / 14)
            self.parts[name] = (shoulder, knee, masked(image, mask * top), masked(image, mask * lower))
            cut = np.maximum(cut, mask * smooth((y - shoulder[1] - 30) / 44))

        self.body = masked(image, 1 - cut)
        self.rest = np.array([[.43, 0., 28.6], [0., .43, 65.2], [0., 0., 1.]])
        self.inverse_rest = np.linalg.inv(self.rest)
        self.resolution = round(FRAME * SUPERSAMPLE)
        self.output_scale = np.diag([SUPERSAMPLE, SUPERSAMPLE, 1.])

    def posed_body(self, neck, tail):
        if max(abs(neck), abs(tail)) < .01:
            return self.body
        width, height = self.body.size
        xs = [*range(0, width, 16), width]
        ys = [*range(0, height, 16), height]
        x, y = np.meshgrid(xs, ys)

        # Blend the ends into the torso so neither the collar nor the tail splits.
        sx, sy = x.astype(float), y.astype(float)
        influences = (
            (rotate(-neck, HEAD_JOINT), (1 - smooth((x - 308) / 128)) * (1 - smooth((y - 226) / 124))),
            (rotate(-tail * .55, TAIL_JOINT), smooth((x - 589) / 68) * smooth((y - 237) / 74)),
        )
        for inverse, strength in influences:
            sx += (inverse[0, 0] * x + inverse[0, 1] * y + inverse[0, 2] - x) * strength
            sy += (inverse[1, 0] * x + inverse[1, 1] * y + inverse[1, 2] - y) * strength
        tiles = []
        for row, (top, bottom) in enumerate(zip(ys, ys[1:])):
            for col, (left, right) in enumerate(zip(xs, xs[1:])):
                corners = ((row, col), (row + 1, col), (row + 1, col + 1), (row, col + 1))
                quad = tuple(value for corner in corners for value in (sx[corner], sy[corner]))
                tiles.append(((left, top, right, bottom), quad))
        return self.body.transform(self.body.size, Image.Transform.MESH, tiles, Image.Resampling.BICUBIC)

    def paint(self, output, layer, transform):
        inverse = np.linalg.inv(self.output_scale @ self.rest @ transform)
        output.alpha_composite(layer.transform(
            output.size, Image.Transform.AFFINE, tuple(inverse[:2].flat), Image.Resampling.BICUBIC
        ))

    def draw(self, pose, move, time):
        (x, y, tilt, squash, neck, front, front_knee, far_front, far_front_knee,
         back, back_knee, far_back, far_back_knee, tail) = pose
        ground_x, ground_y = GROUND_JOINT
        stretch = shift(ground_x, ground_y) @ np.diag([1 + squash * .3, 1 - squash, 1.]) @ shift(-ground_x, -ground_y)
        body = shift(x, y) @ rotate(tilt, GROUND_JOINT) @ stretch
        head = body @ rotate(neck, HEAD_JOINT)
        out = Image.new("RGBA", (self.resolution, self.resolution))

        # The shadow stays on the stage while the hooves leave it.
        airborne = float(smooth(-y / 115))
        shadow = Image.new("RGBA", out.size)
        cx = 202 + x * .43
        rx = 116 - 30 * airborne
        ImageDraw.Draw(shadow).ellipse(
            tuple(int(value * SUPERSAMPLE) for value in (cx - rx, 340, cx + rx, 365)),
            fill=(8, 4, 28, int(107 - 68 * airborne)),
        )
        out.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(10 * SUPERSAMPLE)))

        angles = ((far_front, far_front_knee), (far_back, far_back_knee), (front, front_knee), (back, back_knee))
        for (shoulder, knee, upper, lower), (swing, bend) in zip(self.parts.values(), angles):
            joint = body @ rotate(swing, shoulder)
            self.paint(out, lower, joint @ rotate(bend, knee))
            self.paint(out, upper, joint)
        self.paint(out, self.posed_body(neck, tail), body)

        if move in {"rear", "jump"}:
            landing = .82 if move == "rear" else .71
            progress = (time - landing) / .22
            if 0 < progress < 1:
                dust = ImageDraw.Draw(out)
                for i in range(10):
                    d = (i - 4.5) * (4 + 7 * progress)
                    px = (176 + x * .43 + d) * SUPERSAMPLE
                    py = (353 - (5 + (i * 5 % 14)) * progress) * SUPERSAMPLE
                    radius = (1 + i % 3) * (1.25 - progress) * SUPERSAMPLE
                    dust.ellipse((px - radius, py - radius, px + radius, py + radius),
                                 fill=(255, 208, 130, round(100 * math.sin(math.pi * progress))))
        matrices = []
        for transform in (body, head):
            a, b, e, c, d, f, *_ = (self.rest @ transform @ self.inverse_rest).flat
            matrices.append([round(float(value), 5) for value in (a, c, b, d, e, f)])
        return out.resize((FRAME, FRAME), Image.Resampling.LANCZOS), matrices


def main():
    with Image.open(ROOT / "assets/wilawan-dala-horse.webp") as source:
        puppet = DalaPuppet(source.convert("RGBA"))
    output_dir = ROOT / "assets/dala"
    output_dir.mkdir(exist_ok=True)
    catalog = {}
    for move, (seconds, keyframes) in MOVES.items():
        frame_count = round(FPS * seconds)
        rows = math.ceil(frame_count / COLUMNS)
        atlas = Image.new("RGBA", (FRAME * COLUMNS, FRAME * rows))
        anchors = []
        points = np.asarray(keyframes, dtype=float)
        for frame in range(frame_count):
            time = frame / (frame_count - 1)
            image, matrices = puppet.draw(interpolate(points, time), move, time)
            atlas.paste(image, (frame % COLUMNS * FRAME, frame // COLUMNS * FRAME))
            anchors.append(matrices)
        asset = output_dir / f"{move}.webp"
        atlas.save(asset, "WEBP", quality=79, method=6)
        catalog[move] = {
            "src": f"assets/dala/{move}.webp", "frameWidth": FRAME, "frameHeight": FRAME,
            "columns": COLUMNS, "frameCount": frame_count, "fps": FPS, "accessories": anchors,
        }
        print(f"{move}: {frame_count} frames, {asset.stat().st_size:,} bytes")
    (ROOT / "dala_clips.js").write_text(
        "// Generated by render_dala_moves.py. Frames are stored in compact WebP atlases.\n"
        "window.DalaClips = " + json.dumps(catalog, separators=(",", ":")) + ";\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
