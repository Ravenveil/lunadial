"use client";

// 助眠音景合成器：用 Web Audio API 程序化生成音色，供 Demo 试听。
// 真机期这些内置音景由设备侧 RDK X5 播放；此处仅在 App 内提供可听的预览。

type Handle = {
  stop: () => void;
};

let ctx: AudioContext | null = null;
function audioCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

/** 生成一段循环噪声 buffer */
function noiseBuffer(ac: AudioContext, kind: "white" | "pink" | "brown"): AudioBuffer {
  const len = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") {
      data[i] = w;
    } else if (kind === "pink") {
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    } else {
      // brown
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buf;
}

/**
 * 播放指定音景，返回句柄。id 对应音源库 id。
 * volume 0–1。
 */
export function playSoundscape(id: string, volume = 0.5): Handle {
  const ac = audioCtx();
  void ac.resume();
  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  // 淡入
  master.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.6);

  const nodes: { stop?: () => void }[] = [];

  function noiseSource(kind: "white" | "pink" | "brown", filter?: BiquadFilterNode) {
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer(ac, kind);
    src.loop = true;
    if (filter) {
      src.connect(filter);
      filter.connect(master);
    } else {
      src.connect(master);
    }
    src.start();
    nodes.push({ stop: () => src.stop() });
    return src;
  }

  if (id === "pinknoise") {
    noiseSource("pink");
  } else if (id === "rain") {
    // 雨声：高通白噪 + 缓慢起伏
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;
    noiseSource("white", hp);
  } else if (id === "waves") {
    // 海浪：棕噪 + 低通 + LFO 起伏
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 600;
    noiseSource("brown", lp);
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.12; // ~8s 一次潮汐
    lfoGain.gain.value = volume * 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    nodes.push({ stop: () => lfo.stop() });
  } else if (id === "forest") {
    // 森林：粉噪底 + 偶发鸟鸣
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    noiseSource("pink", lp);
    const timers: ReturnType<typeof setInterval>[] = [];
    const chirp = () => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = 1800 + Math.random() * 1400;
      g.gain.value = 0;
      o.connect(g);
      g.connect(master);
      const now = ac.currentTime;
      g.gain.linearRampToValueAtTime(volume * 0.25, now + 0.05);
      g.gain.linearRampToValueAtTime(0, now + 0.35);
      o.start(now);
      o.stop(now + 0.4);
    };
    const iv = setInterval(() => {
      if (Math.random() > 0.4) chirp();
    }, 1400);
    timers.push(iv);
    nodes.push({ stop: () => timers.forEach(clearInterval) });
  } else {
    // 冥想语音 / 自定义等：柔和粉噪打底
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    noiseSource("pink", lp);
  }

  return {
    stop: () => {
      const now = ac.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.3);
      setTimeout(() => {
        nodes.forEach((n) => {
          try {
            n.stop?.();
          } catch {
            /* already stopped */
          }
        });
        try {
          master.disconnect();
        } catch {
          /* noop */
        }
      }, 350);
    },
  };
}
