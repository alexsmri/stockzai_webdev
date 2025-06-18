import { useUserStore } from "../context/UserStoreContext";

export default function PA_VericationRequest() {
  const utStore = useUserStore()

  utStore.get("TokenVerificationRequest")

  return <div className="look-text-x4">An E-Mail has been sent to you to verify your account.</div>;
}