
'use client";'
import { Avatar, Card, Drawer, Empty, Spin, Tag, Button, Input } from "antd";
import { MemberProfileRecord } from "@/types/member.types";

export const TreePersonCard = ({
    member,
    active = false,
    level,
    onClick,
}: {
    member: MemberProfileRecord;
    active?: boolean;
    level?: number;
    onClick?: () => void;
}) => {
    return (
        <div
            onClick={onClick}
            style={{
                cursor: "pointer",
                borderRadius: 16,
                padding: 14,
                background: active ? "#F0FDF4" : "#fff",
                border: active
                    ? "2px solid #22C55E"
                    : "1px solid #E2E8F0",
                transition: "all .2s",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: active
                    ? "0 10px 30px rgba(34,197,94,.15)"
                    : "0 4px 12px rgba(0,0,0,.05)",
            }}
        >
            <Avatar
                size={44}
                style={{
                    background: active ? "#22C55E" : "#6366F1",
                    flexShrink: 0,
                }}
            >
                {member.fullName?.[0]}
            </Avatar>

            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: 14,
                    }}
                >
                    {member.fullName}
                </div>

                <div
                    style={{
                        color: "#64748B",
                        fontSize: 11,
                    }}
                >
                    {member.branchName}
                </div>
            </div>

            {level !== undefined && (
                <Tag color="blue">F{level + 1}</Tag>
            )}
        </div>
    );
};