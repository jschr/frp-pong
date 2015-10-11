export const log = (message) => (fn) => {
  return (...args) => {
    const retVal = fn(...args);

    console.log(message, args, retVal);

    return retVal;
  };
};

