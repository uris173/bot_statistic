const getStatisticArray = (data, days, type) => {
  let daysArray = []
  for (let i = 1; i <= days; i ++) {
    daysArray.push(0)
  }

  if (type === 'week') {
    data.forEach(element => {
      const day = element.createdAt.getDay() - 1
      daysArray[day] ++
    });
  } else if (type === 'month') {
    data.forEach(element => {
      let date = new Date(element.createdAt).getDate() - 1
      daysArray[date] ++
    });
  } else if (type === 'year') {
    data.forEach(element => {
      let date = new Date(element.createdAt).getMonth()
      daysArray[date] ++
    });
  }

  return daysArray
}


module.exports = {
  getStatisticArray
}