## image resize
```bash
for i in *.png; ffmpeg -i "$i" -vf "scale=1280:-1,format=yuvj420p" -q:v 3 -frames:v 1 "./resize/${i%.*}.jpg";
```
width를 1280으로 일괄 변환