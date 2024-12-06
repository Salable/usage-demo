export const getErrorMessage = async (response: Response, object?: string) => {
  const data = response.headers.get('content-type') === 'application/json' ? await response.json() : null

  if (data?.error) {
    return data.error
  }
  if (response.status === 404) return object ? object + ' not found.' : 'Not found.'

  return 'Unknown Error'
}