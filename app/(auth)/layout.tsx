'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg,#EEF2FF 0%,#F8FAFC 50%,#FFFFFF 100%)',
        display: 'flex',
      }}
    >
      {/* Left */}
      <div
        style={{
          flex: 1,
          display: 'none',
        }}
        className="lg:flex"
      >
        <div
          style={{
            maxWidth: 520,
            padding: 64,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: '#6366F1',
              color: '#fff',
              fontSize: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            ✝
          </div>

          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Bible Discipleship
            <br />
            Management System
          </h1>

          <p
            style={{
              color: '#64748B',
              fontSize: 16,
            }}
          >
            Quản lý sơ đồ môn đồ hóa, lịch sử truyền thừa,
            thư tín và thống kê đào tạo Kinh Thánh.
          </p>
        </div>
      </div>

      {/* Right */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        {children}
      </div>
    </div>
  );
}