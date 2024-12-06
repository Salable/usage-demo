export const FetchError = ({error}: {error: string}) => {
  return (
    <div className='text-red-600'>{error}</div>
  )
}