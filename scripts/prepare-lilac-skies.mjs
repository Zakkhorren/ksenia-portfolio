import sharp from 'sharp';
import { mkdir, readFile, copyFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const originals='source-assets/marketplace/lilac-skies';
const source=process.argv[2] || originals;
const output='public/assets/marketplace/lilac-skies';
await mkdir(originals,{recursive:true}); await mkdir(output,{recursive:true});
const labels=['Lilac Skies — две кисти и упаковка','Сияние на скулах — применение RT454 и RT460','Контур и сияние — две кисти и свотчи','RT454 — мягкий контур','RT460 — точечное сияние'];
const images=[];
for(let i=1;i<=5;i++){
  const id=String(i).padStart(2,'0'),name=`Карточки кистей-${id}.png`;
  const bytes=await readFile(source+'/'+name);
  if(source!==originals)await copyFile(source+'/'+name,originals+'/'+name);
  const metadata=await sharp(bytes).metadata();
  await sharp(bytes).resize({height:3200,withoutEnlargement:true}).webp({quality:95,effort:6}).toFile(`${output}/${id}.webp`);
  await sharp(bytes).resize({width:180,withoutEnlargement:true}).webp({lossless:true,effort:6}).toFile(`${output}/${id}-thumb.webp`);
  images.push({id,original:name,sha256:createHash('sha256').update(bytes).digest('hex'),width:metadata.width,height:metadata.height,src:`/assets/marketplace/lilac-skies/${id}.webp`,thumb:`/assets/marketplace/lilac-skies/${id}-thumb.webp`,alt:labels[i-1]});
}
await sharp(originals+'/Карточки кистей-01.png').resize({width:800,withoutEnlargement:true}).webp({quality:90,effort:6}).toFile(output+'/cover.webp');
await writeFile('src/data/lilac-skies.json',JSON.stringify({id:'market-lilac-skies',title:'Real Techniques — Lilac Skies',cover:'marketplace/lilac-skies/cover.webp',images},null,2)+'\n');
console.log('Prepared five uncropped high-quality web images, thumbnails and cover.');
