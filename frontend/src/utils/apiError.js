export default function apiError(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error?.message || fallback
}
