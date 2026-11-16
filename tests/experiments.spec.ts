import { test, expect } from '@playwright/test';
import data from '../src/data/experiments.json' with { type: 'json' };
for (const width of [1440,1280,768,390]) test(`experiment desktop at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1100});
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto('work/experiments/');await page.evaluate(()=>document.fonts.ready);
  const desktop=page.locator('.experiment-desktop');const win=page.locator('.desk-window');
  await desktop.scrollIntoViewIfNeeded();
  await expect(win).toBeVisible();await expect(page.locator('.desk-objects button')).toHaveCount(4);
  await expect(page.locator('.desk-taskbar time')).toHaveText(/^\d{2}:\d{2}$/);
  const open=async(name:string)=>{await page.getByRole('button',{name:'Закрыть окно',exact:true}).click();await page.locator('.desk-objects').getByRole('button',{name,exact:true}).click();};
  if(width>700){const d=(await desktop.boundingBox())!;const w=(await win.boundingBox())!;expect(w.x-d.x).toBeGreaterThan(160);}
  await page.screenshot({path:`.qa/experiments/readme-${width}.png`});
  await open('Анимация');await expect(page.locator('.desk-grid button')).toHaveCount(3);
  for(let i=0;i<3;i++){
    await page.locator('.desk-grid button').nth(i).click();
    await expect(page.locator('.desk-view>img')).toHaveAttribute('src',new RegExp(data.animations[i].id+'.gif$'));
    await page.locator('.desk-view>img').evaluate((n:HTMLImageElement)=>n.decode());
    expect(await page.locator('.desk-view>img').evaluate((n:HTMLImageElement)=>n.naturalWidth)).toBe(2048);
    await page.keyboard.press('ArrowRight');await expect(page.locator('.desk-view-controls span')).toHaveText(`${(i+1)%3+1} / 3`);
    await page.keyboard.press('Escape');
  }
  await page.screenshot({path:`.qa/experiments/animation-${width}.png`});
  await open('Фотографии');await expect(page.locator('.desk-series')).toHaveCount(1);await expect(page.locator('.desk-series')).toContainText('20 фотографий');
  await expect(page.locator('.desk-photo-stack img').last()).toHaveAttribute('src',/12-thumb.webp$/);
  await page.screenshot({path:`.qa/experiments/series-${width}.png`});
  await page.locator('.desk-series').click();await expect(page.locator('.desk-grid button')).toHaveCount(20);
  await expect(page.locator('.desk-path')).toContainText('Фотографии / Китай');
  const ids=await page.locator('[data-image]').evaluateAll(ns=>ns.map(n=>n.getAttribute('data-image')));expect(ids).toEqual(data.series[0].images.map(i=>i.id));
  await page.locator('.desk-grid img').evaluateAll(ns=>Promise.all(ns.map(async(n)=>{(n as HTMLImageElement).loading='eager';await(n as HTMLImageElement).decode()})));
  await page.screenshot({path:`.qa/experiments/album-${width}.png`});
  await page.locator('.desk-body').evaluate(n=>{n.scrollTop=440});const scroll=await page.locator('.desk-body').evaluate(n=>n.scrollTop);
  await page.getByRole('button',{name:'Свернуть окно',exact:true}).click();await expect(win).toBeHidden();await page.locator('.desk-task').click();await expect(win).toBeVisible();expect(await page.locator('.desk-body').evaluate(n=>n.scrollTop)).toBe(scroll);
  await page.locator('[data-image]').nth(11).click();const albumScroll=await page.locator('.desk-body').evaluate(n=>n.scrollTop); // viewer has reset scroll
  await expect(page.locator('.desk-view-controls span')).toHaveText('12 / 20');
  await page.locator('.desk-start').click();await expect(win).toBeHidden();await page.locator('.desk-task').click();await expect(page.locator('.desk-view-controls span')).toHaveText('12 / 20');
  await page.keyboard.press('Escape');await expect(page.locator('[data-image]').nth(11)).toBeFocused();expect(await page.locator('.desk-body').evaluate(n=>n.scrollTop)).toBeGreaterThan(albumScroll);
  await page.locator('[data-image]').first().click();
  for(let i=0;i<20;i++){
    await expect(page.locator('.desk-view-controls span')).toHaveText(`${i+1} / 20`);
    await expect(page.locator('.desk-view>img')).toHaveAttribute('src',new RegExp(data.series[0].images[i].src.replaceAll('.','\\.')+'$'));
    await page.locator('.desk-view>img').evaluate((n:HTMLImageElement)=>n.decode());
    expect(await page.locator('.desk-view>img').evaluate((n:HTMLImageElement)=>n.naturalWidth>0&&getComputedStyle(n).objectFit==='contain')).toBe(true);
    await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('.desk-view-controls span')).toHaveText('1 / 20');await page.keyboard.press('ArrowLeft');await expect(page.locator('.desk-view-controls span')).toHaveText('20 / 20');
  await page.screenshot({path:`.qa/experiments/photo-${width}.png`});
  await page.getByRole('button',{name:'Развернуть окно',exact:true}).click();
  const d=(await desktop.boundingBox())!;const max=(await win.boundingBox())!;expect(Math.abs(max.width-(d.width-2))).toBeLessThan(2);expect(Math.abs(max.height-(d.height-50))).toBeLessThan(2);
  await page.getByRole('button',{name:'Восстановить размер окна',exact:true}).click();
  if(width>700){const before=(await win.boundingBox())!;const bar=(await page.locator('.desk-titlebar').boundingBox())!;await page.mouse.move(bar.x+30,bar.y+20);await page.mouse.down();await page.mouse.move(d.x-200,d.y-200,{steps:6});await page.mouse.up();let moved=(await win.boundingBox())!;expect(moved.x).toBeGreaterThanOrEqual(d.x);expect(moved.y).toBeGreaterThanOrEqual(d.y);expect(moved.x).toBeLessThan(before.x);await page.setViewportSize({width:width-100,height:900});await page.waitForTimeout(50);const r=(await win.boundingBox())!;const desk=(await desktop.boundingBox())!;expect(r.x+r.width).toBeLessThanOrEqual(desk.x+desk.width);await page.setViewportSize({width,height:1100});}
  await page.keyboard.press('Escape');await expect(page.locator('.desk-grid button')).toHaveCount(20);await page.keyboard.press('Escape');await expect(page.locator('.desk-series')).toHaveCount(1);
  await open('Сайты и приложения');await expect(page.locator('.desk-project-card')).toHaveCount(1);await expect(page.locator('.desk-project-card')).toContainText('Свадебное приглашение');
  await open('прочитай меня.txt');await expect(page.locator('.desk-readme')).toContainText('Без строгого брифа, зато с интересом.');
  await page.keyboard.press('Escape');await expect(win).toBeHidden();await expect(page.locator('.desk-task')).toHaveCount(0);
  await page.screenshot({path:`.qa/experiments/desktop-${width}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  expect(errors).toEqual([]);
});

test('experiments opens through existing site navigation and reduced motion uses original stills',async({page})=>{
  await page.goto('work/logofolio/');await page.locator('.collection-nav a[href$="/experiments/"]').click();await expect(page).toHaveURL(/work\/experiments\/$/);await expect(page.locator('.unavailable-notice')).not.toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Закрыть окно',exact:true}).click();await page.locator('.desk-objects').getByRole('button',{name:'Анимация',exact:true}).click();await page.locator('.desk-grid button').first().click();await expect(page.locator('.desk-view>img')).toHaveAttribute('src',/morning-still.webp$/);
});
