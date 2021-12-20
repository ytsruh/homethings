import React from "react";

export default function Error() {
  return (
    <div className="d-flex justify-content-center" style={styles}>
      <div className="my-auto text-center">
        <h2 className="text-white py-2">500 : Error</h2>
        <h5 className="text-white py-2">Something went wrong. Please try again</h5>
      </div>
    </div>
  );
}

const styles = {
  minHeight: "90vh",
};
