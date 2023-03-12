export function promisify (func) {
  return function () {
    return new Promise((resolve, reject) => {
      try {
        func(resolve);
      } catch (e){
        reject(e);
      }
    })
  }
}