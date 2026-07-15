import TopNavBase from '@/components/shared/TopNavBase';

export default function EmployeeTopNav() {
  return (
    <TopNavBase
      searchPlaceholder="Search my assets..."
      notificationLink="/employee/notifications"
    />
  );
}
