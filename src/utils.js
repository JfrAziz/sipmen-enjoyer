export const delay = (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}