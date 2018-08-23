const logger = (str, num) => (
  console.log(`${str + num}`), 
  setTimeout(_ => logger(str, num+1), 1000)
)

logger(process.argv[2], 1)