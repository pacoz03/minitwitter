interface EmptyStateProps {
  message: string;
  description?: string;
}

const EmptyState = ({ message, description }: EmptyStateProps) => (
  <div className="py-12 text-center text-gray-500">
    <p className="text-lg">{message}</p>
    {description && <p className="text-sm mt-2">{description}</p>}
  </div>
);

export default EmptyState;
