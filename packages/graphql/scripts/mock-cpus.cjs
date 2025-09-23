const os = require("os");

if (typeof os.cpus === "function") {
  const original = os.cpus.bind(os);
  os.cpus = () => {
    const result = original();
    if (!result || result.length === 0) {
      return [
        {
          model: "virtual",
          speed: 0,
          times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }
        }
      ];
    }

    return result;
  };
}
