import { useEffect, useState } from "react";
import { getMyProfile } from "../../api/userService";

export default function ProfilePanel() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getMyProfile();
      setUser(res.data);
    };

    load();
  }, []);

  if (!user) {
    return (
      <div className="profile-loading">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="profile-container">

      <div className="profile-card">

        <h2 className="profile-title">
          👤 Mi perfil
        </h2>

        <div className="profile-info">

          <div className="profile-row">
            <span className="profile-label">
              📧 Email
            </span>

            <span className="profile-value">
              {user.email}
            </span>
          </div>

          <div className="profile-row">
            <span className="profile-label">
              📱 Teléfono
            </span>

            <span className="profile-value">
              {user.telefono || "No disponible"}
            </span>
          </div>

          <div className="profile-row">
            <span className="profile-label">
              🆔 UsuarioID
            </span>

            <span className="profile-value">
              #{user.id}
            </span>
          </div>

        </div>

      </div>

      <style>{`
        .profile-container {
          display: flex;
          justify-content: center;
          padding: 20px;
        }

        .profile-card {
          width: 100%;
          max-width: 520px;
          background: #111118;
          border: 1px solid rgba(147, 51, 234, 0.25);
          border-radius: 18px;
          padding: 24px;
          box-shadow:
            0 0 20px rgba(147, 51, 234, 0.12),
            0 0 40px rgba(52, 211, 153, 0.05);
        }

        .profile-title {
          margin: 0 0 22px 0;
          font-size: 24px;
          color: #c084fc;
          text-shadow: 0 0 10px rgba(192, 132, 252, 0.25);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .profile-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.2s ease;
        }

        .profile-row:hover {
          border-color: rgba(52, 211, 153, 0.22);
          box-shadow: 0 0 14px rgba(52, 211, 153, 0.08);
        }

        .profile-label {
          font-weight: 600;
          color: #34d399;
        }

        .profile-value {
          color: #fff;
          text-align: right;
          word-break: break-word;
        }

        .profile-loading {
          padding: 30px;
          text-align: center;
          color: #c084fc;
        }
      `}</style>

    </div>
  );
}