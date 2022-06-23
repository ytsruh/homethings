import React from "react";

export default function Custom404() {
  return (
    <div className="d-flex justify-content-center" style={styles}>
      <div className="my-auto text-center">
        <h2 className="text-white py-2">404 : Not Found</h2>
        <h5 className="text-white py-2">We can't find the page you're looking for</h5>
      </div>
    </div>
  );
}

const styles = {
  minHeight: "90vh",
};
