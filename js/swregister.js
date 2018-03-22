if (navigator.serviceWorker) {
  navigator.serviceWorker.register("../sw.js").then((reg) => {
    console.log("SW registered");
  }).catch((err) => {
    console.log("SW not registered; ", err);
  });
}
