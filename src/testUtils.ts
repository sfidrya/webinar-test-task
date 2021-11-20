const bytesPerChar = 2;
const charsPerMb = (1024 * 1024) / bytesPerChar;

export function fillLocalStorage(
  stringSize: number = charsPerMb,
  keyNumber: number = 1
) {
  const key = `test${keyNumber}`;
  try {
    const mockString = repeatChar(stringSize, "a");
    let filler = "";
    while (true) {
      filler += mockString;
      localStorage.setItem(key, filler);
    }
  } catch (error) {
    if (stringSize / 2 < 1) {
      console.log("Storage filled to maximum");
      return;
    }
    stringSize = Math.floor(stringSize / 2);
    fillLocalStorage(stringSize, keyNumber + 1);
  }
}

export function clearLocalStorage() {
  let keyNumber = 0;
  while (true) {
    const key = `test${keyNumber}`;
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    } else {
      console.log("Storage cleared");
      return;
    }
    ++keyNumber;
  }
}

function repeatChar(count: number, ch: string) {
  if (count === 0) {
    return "";
  }
  let count2 = count / 2;
  let result = ch;

  while (result.length <= count2) {
    result += result;
  }
  return result + result.substring(0, count - result.length);
}

// For use in browser console
(window as any).fillLocalStorage = fillLocalStorage;
(window as any).clearLocalStorage = clearLocalStorage;
