
/**
 *
 * @param {*} data
 * @param {string} filename
 * @param {string} type
 */
 export function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  