import { logout } from "./(auth)/actions";
import { getUserFromToken } from "./actions";

export default async function Home() {
  const user = await getUserFromToken();

  return (
    <div>
      <h1>Omaliya Cosmetics</h1>
      <h2>{user?.firstName}</h2>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
