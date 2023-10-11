import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
import { FormSignIn } from "./_components/FormSignIn";

const SignInPage = async () => {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    return redirect("/");
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <FormSignIn />
    </div>
  );
};

export default SignInPage;
