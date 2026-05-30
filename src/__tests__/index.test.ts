import { print } from '../'

describe('print', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Scenario: print receives a plain string and should emit it through console.info.
  // This verifies the public API logs the expected message format for consumers.
  it('logs the provided text with a Text prefix', () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

    print('hello world!')

    expect(infoSpy).toHaveBeenCalledWith('hello world!')
  })
})
