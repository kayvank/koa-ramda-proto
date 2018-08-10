import R from 'ramda'
import Task from 'data.task'
import Either from 'data.either'

export const wait = duration => task =>
  setTimeout(() => unsafeRun(task), duration)

export const scheduleOnce = when => task => wait(when)(task)
export const unsafeRun = task =>
  task.fork(
    error => {
      console.log(`TASK ERROR = ${error}`)
      return Either.Left(error)
    },
    data => {
      console.log(`TASK SUCCESS WITH DATA = ${data}`)
      return Either.of(data)
    }
  )
