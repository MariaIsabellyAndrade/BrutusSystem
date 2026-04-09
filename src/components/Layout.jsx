import Header from "./Header";


export default function Layout({ children }) {
  return (
    <>
      <Header />

      <main style={{ minHeight: "80vh" }}>
        {children}
      </main>

    </>
  );
}