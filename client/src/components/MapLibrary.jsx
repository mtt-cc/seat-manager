function mapObjectsToArrays(objectList, cols) {
    const result = [];
    let currentRow = [];
  
    objectList.forEach((obj, index) => {
      currentRow.push(obj);
  
      if (currentRow.length === cols || index === objectList.length - 1) {
        result.push(currentRow);
        currentRow = [];
      }
    });
  
    return result;
  }

  export {mapObjectsToArrays};