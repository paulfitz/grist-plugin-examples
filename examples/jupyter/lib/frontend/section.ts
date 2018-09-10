// tslint:disable:no-console
import {dom} from 'grainjs';
import * as grist from 'grist-plugin-api';

async function init() {
  if (!await thirdPartyCookieCheck()) {
    throw new Error('Using Jupyter Notebook in Grist requires Third-Party Cookies to be enabled');
  }
  const result = await grist.rpc.callRemoteFunc("startOrReuse@dist/backend/main.js", location.origin);
  console.log("RESULT", result);
  document.getElementById('loading')!.style.display = 'none';
  document.getElementById('title')!.style.display = 'none';
  document.body.appendChild(dom('iframe.full', {src: result}));
  setInterval(() => grist.rpc.postMessageForward("dist/backend/main.js", "ping"), 60000);
}

function thirdPartyCookieCheck() {
  return new Promise((resolve) => {
    const iframe = dom('iframe', {src: 'third-party-cookie-check.html'}, dom.hide(true));
    const lis = dom.onElem(window, 'message', (evt) => {
      const ev = evt as MessageEvent;
      if (typeof ev.data === 'string' && ev.data.startsWith('third-party-cookie=')) {
        lis.dispose();
        document.body.removeChild(iframe);
        resolve(ev.data.split('=')[1] === 'true');
      }
    });
    document.body.appendChild(iframe);
  });
}

grist.ready();
init().catch((e) => {
  console.log("ERROR", e);
  document.getElementById('loading')!.style.display = 'none';
  if (/spawn.*ENOENT/.test(e.message)) {
    document.getElementById('instructions')!.style.display = 'block';
  } else {
    document.body.appendChild(dom('div.message', e.message));
  }
});
