import Sidebar from "../components/Sidebar";

type Props = {
  children: React.ReactNode;
};

function MainLayout({ children }: Props) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "30px",
          backgroundColor: "#f4f7fc",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default MainLayout;