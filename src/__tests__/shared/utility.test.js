import { debounce } from '../../shared/utility'

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should call the debounced function after the specified delay', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    jest.advanceTimersByTime(500)

    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(500)

    expect(mockFn).toHaveBeenCalled()
  })
})
