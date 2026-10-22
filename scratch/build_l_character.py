
import os
from PIL import Image, ImageOps
import numpy as np

def fit_to_frame(src_path, target_h=51, foot_y=62, offset_x=0, offset_y=0):
    im = Image.open(src_path)
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    cw, ch = cropped.size
    aspect = cw / ch
    tw = max(1, int(round(target_h * aspect)))
    th = target_h
    resized = cropped.resize((tw, th), Image.LANCZOS)
    
    frame = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    x = 32 - tw // 2 + offset_x
    y = foot_y - th + offset_y
    frame.paste(resized, (x, y), resized)
    return frame

# 1. GENERATE SPRITESHEET FRAMES
frames = {}

# Idle (Row 0, 4 frames)
f_idle0 = fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_01.png', 51, 62)
# Frame 1: subtle breathing (head static, chest +1px)
f_idle1 = f_idle0.copy()
# Frame 2: dip 1px
f_idle2 = fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_01.png', 50, 62, offset_y=1)
# Frame 3: return
f_idle3 = f_idle0.copy()
frames['idle'] = [f_idle0, f_idle1, f_idle2, f_idle3]

# Walk (Row 1, 6 frames)
walk_sources = [
    'walk_frame_01', 'walk_frame_03', 'walk_frame_05',
    'walk_frame_06', 'walk_frame_08', 'walk_frame_10'
]
frames['walk'] = [fit_to_frame(f'scratch/l_assets/l_pixel_game_assets/walk/{s}.png', 51, 62) for s in walk_sources]

# Run (Row 2, 6 frames)
frames['run'] = [f.copy() for f in frames['walk']]

# Jump (Row 3, 4 frames)
frames['jump'] = [
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_01.png', 51, 61),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_04.png', 51, 58),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_06.png', 51, 58),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_08.png', 51, 60),
]

# Land (Row 4, 2 frames)
frames['land'] = [
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_05.png', 49, 62, offset_y=2),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_01.png', 51, 62),
]

# Crouch (Row 5, 2 frames)
frames['crouch'] = [
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/actions/crouch_sit_01.png', 42, 62),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/actions/crouch_ponder_02.png', 42, 62),
]

# Hurt (Row 6, 2 frames)
frames['hurt'] = [
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/actions/crouch_sit_01.png', 42, 62, offset_x=-2),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/walk/walk_frame_07.png', 51, 62, offset_x=-3),
]

# Talk (Row 7, 4 frames)
# L standing with talking animation
f_talk0 = f_idle0.copy()

f_talk1 = f_idle0.copy()
arr1 = np.array(f_talk1)
arr1[26, 32] = [60, 45, 45, 255]
f_talk1 = Image.fromarray(arr1)

f_talk2 = f_idle0.copy()
arr2 = np.array(f_talk2)
arr2[26:28, 31:33] = [55, 40, 40, 255]
f_talk2 = Image.fromarray(arr2)

f_talk3 = f_talk1.copy()
frames['talk'] = [f_talk0, f_talk1, f_talk2, f_talk3]

# Notes (Row 8, 4 frames)
# L's special actions: thumb on lip, pondering, laptop, strawberry cake!
frames['notes'] = [
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/actions/crouch_thumb_lip_03.png', 42, 62),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/actions/crouch_ponder_02.png', 42, 62),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/actions/crouch_laptop_05.png', 42, 62),
    fit_to_frame('scratch/l_assets/l_pixel_game_assets/actions/crouch_eating_04.png', 42, 62),
]

# Save individual frames in assets/karakter/raka/frames/
out_frames_dir = 'assets/karakter/raka/frames'
os.makedirs(out_frames_dir, exist_ok=True)
for anim_name, flist in frames.items():
    for idx, f in enumerate(flist):
        f.save(os.path.join(out_frames_dir, f'{anim_name}_{idx:02d}.png'))

# Build composite spritesheet (384x576)
sheet = Image.new('RGBA', (384, 576), (0, 0, 0, 0))
row_map = {
    'idle': 0, 'walk': 1, 'run': 2, 'jump': 3,
    'land': 4, 'crouch': 5, 'hurt': 6, 'talk': 7, 'notes': 8
}
for anim_name, flist in frames.items():
    row = row_map[anim_name]
    for col, f in enumerate(flist):
        sheet.paste(f, (col * 64, row * 64))

sheet.save('assets/karakter/raka/spritesheet.png')

# spritesheet_left (horizontally flipped)
sheet_left = Image.new('RGBA', (384, 576), (0, 0, 0, 0))
for row in range(9):
    for col in range(6):
        cell = sheet.crop((col * 64, row * 64, (col + 1) * 64, (row + 1) * 64))
        if cell.getbbox():
            cell_flipped = ImageOps.mirror(cell)
            sheet_left.paste(cell_flipped, (col * 64, row * 64))
sheet_left.save('assets/karakter/raka/spritesheet_left.png')

# spritesheet_x4
sheet_x4 = sheet.resize((384 * 4, 576 * 4), Image.NEAREST)
sheet_x4.save('assets/karakter/raka/spritesheet_x4.png')

# Animated preview.gif
gif_frames = frames['idle'] + frames['walk'] + frames['talk'] + frames['notes']
gif_frames[0].save(
    'assets/karakter/raka/preview.gif',
    save_all=True,
    append_images=gif_frames[1:],
    duration=160,
    loop=0,
    disposal=2
)
print('Spritesheets & frames generated successfully!')

# 2. GENERATE PORTRAITS
clean_bg = Image.open('scratch/clean_portrait_frame.png')
p_base = Image.open('assets/potret/potret_raka_netral.png')
p_arr = np.array(p_base)

def build_portrait(src_path, crop_rect=None, center_x_offset=0):
    src = Image.open(src_path)
    if crop_rect:
        src = src.crop(crop_rect)
    w, h = src.size
    scale = 0.62
    nw = int(round(w * scale))
    nh = int(round(h * scale))
    resized = src.resize((nw, nh), Image.LANCZOS)
    
    trans = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    x = 64 - nw // 2 + center_x_offset
    y = 8
    trans.paste(resized, (x, y), resized)
    
    framed = clean_bg.copy()
    framed.paste(trans, (0, 0), trans)
    
    # Re-stamp border
    framed_arr = np.array(framed)
    for yy in range(128):
        for xx in range(128):
            if xx < 3 or xx >= 125 or yy < 3 or yy >= 125:
                framed_arr[yy, xx] = p_arr[yy, xx]
    framed = Image.fromarray(framed_arr)
    return trans, framed

por_data = {
    'netral': ('scratch/l_assets/l_pixel_game_assets/idle/idle_turn_01.png', (0, 0, 93, 185), 0),
    'bicara': ('scratch/l_assets/l_pixel_game_assets/actions/crouch_thumb_lip_03.png', (0, 0, 136, 185), -2),
    'terkejut': ('scratch/l_assets/l_pixel_game_assets/idle/idle_turn_03.png', (0, 0, 89, 185), 0),
    'terpejam': ('scratch/l_assets/l_pixel_game_assets/actions/crouch_ponder_02.png', (0, 0, 133, 185), -2),
}

por_framed_imgs = {}
for emotion, (path, crop_r, off_x) in por_data.items():
    t_img, f_img = build_portrait(path, crop_r, off_x)
    t_img.save(f'assets/potret/potret_raka_{emotion}_transparan.png')
    f_img.save(f'assets/potret/potret_raka_{emotion}.png')
    por_framed_imgs[emotion] = f_img

# potret_raka_semua.png (256x256 composite)
grid = Image.new('RGBA', (256, 256), (0, 0, 0, 255))
grid.paste(por_framed_imgs['netral'], (0, 0))
grid.paste(por_framed_imgs['bicara'], (128, 0))
grid.paste(por_framed_imgs['terkejut'], (0, 128))
grid.paste(por_framed_imgs['terpejam'], (128, 128))
grid.save('assets/potret/potret_raka_semua.png')

print('All portraits generated successfully!')
