"use client";

import { addTransaction } from "@/app/actions/addTransaction";
import { useRef } from "react";
import { toast } from "react-toastify";

export const AddTransaction = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const clientAction = async (formData: FormData) => {
    const { data, error } = await addTransaction(formData);

    if (error) {
      toast.error(error);
    } else {
      formRef.current?.reset();
      toast.success("Transaction added");
    }
  };

  return (
    <>
      <h3>Add transaction</h3>
      <form ref={formRef} action={clientAction}>
        <div className="form-control">
          <label htmlFor="text">Text</label>
          <input id="text" name="text" type="text" />
        </div>
        <div className="form-control">
          <label htmlFor="amount">
            Amount <br /> (negative - is expense, positive - is income)
          </label>
          <input id="text" name="amount" type="number" step="0.01" />
        </div>
        <button className="btn">Add transaction</button>
      </form>
    </>
  );
};
