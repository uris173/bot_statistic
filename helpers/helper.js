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

const upload = async (req, res) => {
  let file = req.files.file
  file.url = `files/${Date.now()}_${file.name}`
  await file.mv(file.url)
  res.status(200).json(file.name)
}


module.exports = {
  getStatisticArray,
  upload
}