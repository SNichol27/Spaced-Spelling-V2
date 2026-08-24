export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </th>
            <th className="text-left py-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </th>
            <th className="text-left py-2">
              <div className="h-4 bg-gray-200 rounded w-28"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-t">
              <td className="py-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="py-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="py-4">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
