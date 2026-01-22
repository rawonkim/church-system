import { getUsers } from "@/app/actions";
import { AddUserForm } from "@/components/AddUserForm";
import { UserList } from "@/components/UserList";

export default async function AdminPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">교인 관리 (Admin)</h1>
        <p className="text-slate-500 mt-2">교인 명단을 관리하고 기부금 영수증 발급 대상을 설정합니다.</p>
      </div>

      <AddUserForm />
      <UserList users={users} />
    </div>
  );
}
