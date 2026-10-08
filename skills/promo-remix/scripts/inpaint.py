"""Remove baked-in text from a reference frame so photos can be reused as assets.
Usage: python3 inpaint.py in.png out.png x0,y0,x1,y1[,thresh] ...
thresh>0 masks only pixels brighter than thresh inside the box (white text); 0 or omitted masks the whole box.
Needs opencv: pip install opencv-python-headless
"""
import sys, cv2, numpy as np
src, dst, boxes = sys.argv[1], sys.argv[2], sys.argv[3:]
im = cv2.imread(src); g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY); mask = np.zeros(g.shape, np.uint8)
for b in boxes:
    v = [int(x) for x in b.split(',')]; x0, y0, x1, y1 = v[:4]; th = v[4] if len(v) > 4 else 0
    sub = g[y0:y1, x0:x1]
    mask[y0:y1, x0:x1] = (sub > th).astype(np.uint8) * 255 if th > 0 else 255
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)
cv2.imwrite(dst, cv2.inpaint(im, mask, 9, cv2.INPAINT_TELEA))
