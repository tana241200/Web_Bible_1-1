"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Layout, Input, Tag, Button, Select, Avatar, Drawer, Empty, message } from "antd";
import { BookOutlined, CloseOutlined, SendOutlined, EyeOutlined } from "@ant-design/icons";
import {
    ReactFlow, Background, Controls, MiniMap, addEdge,
    useNodesState, useEdgesState, Handle, Position, MarkerType, Panel,
    type NodeTypes, type Connection,
    BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
const { Sider, Header, Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
// ─── i18n ──────────────────────────────────────────────────────────────────────
const T: Record<string, Record<string, string>> = {
    vi: {
        appName: "Môn Đồ Hóa",
        appSub: "Hệ thống sơ đồ truyền thừa",
        dashboard: "Tổng quan",
        diagram: "Sơ đồ truyền thừa",
        adminPanel: "Quản trị",
        members: "Thành viên",
        messages: "Thư tín",
        settings: "Cài đặt",
        selectCourse: "Chọn môn học",
        myDiagram: "Xem sơ đồ của tôi",
        totalMembers: "Tổng thành viên",
        totalMentors: "Người hướng dẫn",
        totalDisciples: "Môn đồ",
        totalCompletions: "Lượt hoàn thành",
        activeBranches: "Chi nhánh",
        totalMessages: "Thư tín đã gửi",
        searchPlaceholder: "Tìm tên, chi nhánh, môn học...",
        mentor: "Người hướng dẫn",
        disciple: "Môn đồ",
        branch: "Chi nhánh",
        course: "Môn học",
        startMonth: "Tháng bắt đầu",
        endMonth: "Tháng kết thúc",
        sendMessage: "Gửi thư tín",
        messagePlaceholder: "Nhập nội dung thư tín...",
        noMentorFound: "Không tìm thấy người hướng dẫn?",
        registerMentor: "Đăng ký người hướng dẫn mới",
        pendingApproval: "Chờ duyệt",
        approve: "Duyệt",
        reject: "Từ chối",
        courses: "Danh mục môn học",
        addCourse: "Thêm môn học",
        statistics: "Thống kê",
        topMentors: "Người hướng dẫn xuất sắc",
        allLinks: "Bảng liên kết huấn luyện",
        dragZoom: "Kéo để di chuyển · Cuộn để zoom · Click node để xem chi tiết",
        login: "Đăng nhập",
        logout: "Đăng xuất",
        selectMentor: "Chọn người hướng dẫn",
        confirmDelete: "Xác nhận xóa?",
        save: "Lưu",
        cancel: "Hủy",
        close: "Đóng",
        send: "Gửi",
        mentorStats: "Thống kê đào tạo",
        disciples: "môn đồ",
        generation: "thế hệ",
        viewTree: "Xem cây",
        addLink: "Thêm liên kết",
    },
    en: {
        appName: "Discipleship",
        appSub: "Lineage diagram system",
        dashboard: "Dashboard",
        diagram: "Lineage Diagram",
        adminPanel: "Admin",
        members: "Members",
        messages: "Messages",
        settings: "Settings",
        selectCourse: "Select course",
myDiagram: "My Diagram",
        totalMembers: "Total Members",
        totalMentors: "Mentors",
        totalDisciples: "Disciples",
        totalCompletions: "Completions",
        activeBranches: "Branches",
        totalMessages: "Messages Sent",
        searchPlaceholder: "Search name, branch, course...",
        mentor: "Mentor",
        disciple: "Disciple",
        branch: "Branch",
        course: "Course",
        startMonth: "Start Month",
        endMonth: "End Month",
        sendMessage: "Send Message",
        messagePlaceholder: "Type your message...",
        noMentorFound: "Mentor not found?",
        registerMentor: "Register New Mentor",
        pendingApproval: "Pending Approval",
        approve: "Approve",
        reject: "Reject",
        courses: "Course Catalog",
        addCourse: "Add Course",
        statistics: "Statistics",
        topMentors: "Top Mentors",
        allLinks: "Training Links Table",
        dragZoom: "Drag to pan · Scroll to zoom · Click node for details",
        login: "Login",
        logout: "Logout",
        selectMentor: "Select mentor",
        confirmDelete: "Confirm delete?",
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        send: "Send",
        mentorStats: "Training Stats",
        disciples: "disciples",
        generation: "generation",
        viewTree: "View Tree",
        addLink: "Add Link",
    },
    ko: {
        appName: "제자화",
        appSub: "계보 다이어그램 시스템",
        dashboard: "대시보드",
        diagram: "계보 다이어그램",
        adminPanel: "관리자",
        members: "회원",
        messages: "서신",
        settings: "설정",
        selectCourse: "과목 선택",
        myDiagram: "내 다이어그램",
        totalMembers: "전체 회원",
        totalMentors: "목자",
        totalDisciples: "제자",
        totalCompletions: "완료 횟수",
        activeBranches: "지부",
        totalMessages: "발송 서신",
        searchPlaceholder: "이름, 지부, 과목 검색...",
        mentor: "목자",
        disciple: "제자",
        branch: "지부",
        course: "과목",
        startMonth: "시작 월",
        endMonth: "종료 월",
        sendMessage: "서신 보내기",
        messagePlaceholder: "서신 내용을 입력하세요...",
        noMentorFound: "목자를 찾을 수 없나요?",
        registerMentor: "새 목자 등록",
        pendingApproval: "승인 대기",
        approve: "승인",
        reject: "거절",
        courses: "과목 목록",
        addCourse: "과목 추가",
        statistics: "통계",
        topMentors: "우수 목자",
        allLinks: "훈련 연결 목록",
        dragZoom: "드래그로 이동 · 스크롤로 확대/축소 · 노드 클릭 시 상세 정보",
        login: "로그인",
        logout: "로그아웃",
        selectMentor: "목자 선택",
        confirmDelete: "삭제 확인?",
        save: "저장",
        cancel: "취소",
        close: "닫기",
        send: "보내기",
        mentorStats: "훈련 통계",
        disciples: "제자",
        generation: "세대",
        viewTree: "트리 보기",
        addLink: "연결 추가",
    },
};
// ─── Seed Data ─────────────────────────────────────────────────────────────────
const COURSES = [
    { id: "c1", name: "Sáng thế ký 1", nameEn: "Genesis 1", nameKo: "창세기 1" },
    { id: "c2", name: "Lớp Đồng hành 1 kèm 1", nameEn: "1-on-1 Companion Class", nameKo: "1대1 동반 수업" },
    { id: "c3", name: "Khái luận Cựu ước", nameEn: "OT Survey", nameKo: "구약 개론" },
    { id: "c4", name: "Khái luận Tân ước", nameEn: "NT Survey", nameKo: "신약 개론" },
];
const MEMBERS = [
    { id: "m1", name: "Lê Mục Sư", branch: "Chi nhánh Hà Nội", dob: "1970-03-15", email: "lemucsu@gmail.com", role: "admin" },
    { id: "m2", name: "Phạm Hướng Dẫn", branch: "Chi nhánh Sài Gòn", dob: "1980-06-20", email: "phamhuongdan@gmail.com", role: "mentor" },
    { id: "m3", name: "Trần Môn Đồ", branch: "Chi nhánh Đà Nẵng", dob: "1990-09-10", email: "tranmondo@gmail.com", role: "member" },
    { id: "m4", name: "Nguyễn Vâng Phục", branch: "Chi nhánh Hà Nội", dob: "1992-01-05", email: "nguyenvangphuc@gmail.com", role: "member" },
    { id: "m5", name: "Lê Chiên Con", branch: "Chi nhánh Sài Gòn", dob: "1995-11-22", email: "lechiéncon@gmail.com", role: "member" },
    { id: "m6", name: "Võ Tin Kính", branch: "Chi nhánh Đà Nẵng", dob: "1993-07-14", email: "votinking@gmail.com", role: "member" },
    { id: "m7", name: "Đặng Yêu Thương", branch: "Chi nhánh Hà Nội", dob: "1997-04-30", email: "dangyeuthuong@gmail.com", role: "member" },
    { id: "m8", name: "Bùi Trung Tín", branch: "Chi nhánh Sài Gòn", dob: "1988-12-03", email: "buitrungtin@gmail.com", role: "mentor" },
];
// Training links: who taught whom, in which course, which period
const TRAINING_LINKS = [
    { id: "l1", mentorId: "m1", discipleId: "m2", courseId: "c1", startMonth: "2022-01", endMonth: "2022-06", branch: "Chi nhánh Hà Nội" },
    { id: "l2", mentorId: "m1", discipleId: "m8", courseId: "c1", startMonth: "2022-02", endMonth: "2022-08", branch: "Chi nhánh Hà Nội" },
    { id: "l3", mentorId: "m2", discipleId: "m3", courseId: "c1", startMonth: "2022-07", endMonth: "2022-12", branch: "Chi nhánh Sài Gòn" },
    { id: "l4", mentorId: "m2", discipleId: "m4", courseId: "c1", startMonth: "2022-09", endMonth: "2023-03", branch: "Chi nhánh Sài Gòn" },
    { id: "l5", mentorId: "m8", discipleId: "m5", courseId: "c1", startMonth: "2023-01", endMonth: "2023-06", branch: "Chi nhánh Sài Gòn" },
    { id: "l6", mentorId: "m8", discipleId: "m6", courseId: "c1", startMonth: "2023-03", endMonth: "2023-09", branch: "Chi nhánh Đà Nẵng" },
    { id: "l7", mentorId: "m3", discipleId: "m7", courseId: "c1", startMonth: "2023-06", endMonth: "2024-01", branch: "Chi nhánh Đà Nẵng" },
    // Course c2
    { id: "l8", mentorId: "m1", discipleId: "m2", courseId: "c2", startMonth: "2023-01", endMonth: "2023-06", branch: "Chi nhánh Hà Nội" },
    { id: "l9", mentorId: "m2", discipleId: "m5", courseId: "c2", startMonth: "2023-07", endMonth: "2024-01", branch: "Chi nhánh Sài Gòn" },
// Course c3
    { id: "l10", mentorId: "m1", discipleId: "m8", courseId: "c3", startMonth: "2023-06", endMonth: "2023-12", branch: "Chi nhánh Hà Nội" },
    { id: "l11", mentorId: "m8", discipleId: "m6", courseId: "c3", startMonth: "2024-01", endMonth: "2024-06", branch: "Chi nhánh Đà Nẵng" },
];
const MESSAGES_DATA = [
    { id: "msg1", fromId: "m3", toId: "m2", content: "Kính thưa anh, em muốn hỏi về bài học tuần này.", time: "2024-01-10 09:15" },
    { id: "msg2", fromId: "m2", toId: "m3", content: "Chào em, anh sẵn lòng giải đáp nhé!", time: "2024-01-10 10:00" },
    { id: "msg3", fromId: "m5", toId: "m8", content: "Cảm ơn anh đã dạy dỗ em trong môn học này.", time: "2024-01-12 14:30" },
];
const PENDING_MENTORS = [
    { id: "p1", name: "Hoàng Mới Đến", branch: "Chi nhánh Cần Thơ", contact: "hoang@email.com", reason: "Mục sư đang dạy nhưng chưa có tài khoản", submittedBy: "m3" },
];
// ─── Tree Builder ──────────────────────────────────────────────────────────────
function buildTreeForCourse(courseId: string, focusMemberId?: string) {
    const links = TRAINING_LINKS.filter((l) => l.courseId === courseId);
    if (links.length === 0) return { nodes: [], edges: [] };
    // Find all mentor IDs and disciple IDs
    const allMentorIds = [...new Set(links.map((l) => l.mentorId))];
    const allDiscipleIds = [...new Set(links.map((l) => l.discipleId))];
    // Roots = mentors that are not disciples of anyone in this course
    const rootIds = allMentorIds.filter((id) => !allDiscipleIds.includes(id));
    // Count disciples per mentor
    const discipleCount: Record<string, number> = {};
    links.forEach((l) => {
        discipleCount[l.mentorId] = (discipleCount[l.mentorId] || 0) + 1;
    });
    // BFS layout
    const levelMap: Record<string, number> = {};
    const queue = [...rootIds];
    rootIds.forEach((id) => (levelMap[id] = 0));
    const visited = new Set(rootIds);
    while (queue.length > 0) {
        const cur = queue.shift()!;
        const children = links.filter((l) => l.mentorId === cur).map((l) => l.discipleId);
        children.forEach((c) => {
            if (!visited.has(c)) {
                visited.add(c);
                levelMap[c] = (levelMap[cur] || 0) + 1;
                queue.push(c);
            }
        });
    }
    // Group by level
    const byLevel: Record<number, string[]> = {};
    Object.entries(levelMap).forEach(([id, lv]) => {
        if (!byLevel[lv]) byLevel[lv] = [];
        byLevel[lv].push(id);
    });
    // Assign positions
    const posMap: Record<string, { x: number; y: number }> = {};
    const NODE_W = 200, NODE_H = 90, GAP_X = 40, GAP_Y = 100;
    Object.entries(byLevel).forEach(([lvStr, ids]) => {
        const lv = Number(lvStr);
        const totalW = ids.length * NODE_W + (ids.length - 1) * GAP_X;
        const startX = -totalW / 2;
        ids.forEach((id, i) => {
posMap[id] = { x: startX + i * (NODE_W + GAP_X), y: lv * (NODE_H + GAP_Y) };
        });
    });
    // Build nodes – each link may create duplicate disciple node for same person in multiple sessions
    const nodeIds = new Set<string>();
    const rfNodes: any[] = [];
    // Mentor nodes
    allMentorIds.forEach((id) => {
        if (nodeIds.has(id)) return;
        nodeIds.add(id);
        const member = MEMBERS.find((m) => m.id === id);
        const isFocus = focusMemberId === id;
        rfNodes.push({
            id,
            type: "mentorNode",
            position: posMap[id] || { x: 0, y: 0 },
            data: {
                member,
                discipleCount: discipleCount[id] || 0,
                isMentor: true,
                isFocus,
                courseId,
            },
        });
    });
    // Disciple nodes (per link to support duplicates if same person taught multiple times)
    links.forEach((link) => {
        const nodeId = `${link.id}_disc`;
        const member = MEMBERS.find((m) => m.id === link.discipleId);
        const isFocus = focusMemberId === link.discipleId;
        // Use disciple's position if they are also a mentor; else use link-specific position
        const pos = posMap[link.discipleId] || { x: 0, y: 0 };
        if (!nodeIds.has(link.discipleId)) {
            nodeIds.add(link.discipleId);
            rfNodes.push({
                id: link.discipleId,
                type: "discipleNode",
                position: pos,
                data: { member, link, isFocus, courseId, discipleCount: discipleCount[link.discipleId] || 0 },
            });
        }
    });
    // Edges
    const rfEdges = links.map((link) => ({
        id: `e_${link.id}`,
        source: link.mentorId,
        target: allMentorIds.includes(link.discipleId) ? link.discipleId : link.discipleId,
        animated: true,
        style: { stroke: "#6366F1", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366F1" },
        type: "smoothstep",
    }));
    // Virtual root node (course name)
    const course = COURSES.find((c) => c.id === courseId);
    rfNodes.unshift({
        id: "root",
        type: "rootNode",
        position: { x: -110, y: -130 },
        data: { courseName: course?.name || courseId },
    });
    rootIds.forEach((rid) => {
        rfEdges.unshift({
            id: `e_root_${rid}`,
            source: "root",
            target: rid,
            animated: false,
            style: { stroke: "#14B8A6", strokeWidth: 2, strokeDasharray: "5,3" } as any,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#14B8A6" },
            type: "smoothstep",
        });
    });
    return { nodes: rfNodes, edges: rfEdges };
}
// ─── Custom Node: Root ─────────────────────────────────────────────────────────
const RootNode = ({ data }: any) => (
    <div style={{
        background: "linear-gradient(135deg,#0F172A,#1E3A5F)",
color: "#fff", borderRadius: 12, padding: "10px 22px",
        fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(15,23,42,0.35)",
        textAlign: "center", minWidth: 200,
        border: "2px solid #38BDF8",
    }}>
        <BookOutlined style={{ marginRight: 6, color: "#38BDF8" }} />
        {data.courseName}
        <Handle type="source" position={Position.Bottom} style={{ background: "#14B8A6", width: 10, height: 10 }} />
    </div>
);
// ─── Custom Node: Mentor ───────────────────────────────────────────────────────
const MentorNode = ({ data, selected }: any) => {
    const { member, discipleCount, isFocus } = data;
    return (
        <div style={{
            background: isFocus ? "linear-gradient(135deg,#EEF2FF,#E0E7FF)" : "#fff",
            border: `2px solid ${isFocus ? "#6366F1" : selected ? "#6366F1" : "#C7D2FE"}`,
            borderRadius: 12, padding: "10px 14px", width: 196,
            boxShadow: isFocus
                ? "0 0 0 4px #6366F130, 0 4px 16px rgba(99,102,241,0.2)"
                : "0 2px 8px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
            cursor: "pointer",
        }}>
            <Handle type="target" position={Position.Top} style={{ background: "#6366F1", width: 9, height: 9 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Avatar size={32} style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", fontSize: 13, fontWeight: 700 }}>
                    {member?.name?.[0] || "?"}
                </Avatar>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{member?.name}</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>{member?.branch}</div>
                </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Tag color="geekblue" style={{ fontSize: 10, margin: 0 }}>
                    👤 {discipleCount} môn đồ
                </Tag>
                <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>Người HD</Tag>
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: "#6366F1", width: 9, height: 9 }} />
        </div>
    );
};
// ─── Custom Node: Disciple ─────────────────────────────────────────────────────
const DiscipleNode = ({ data, selected }: any) => {
    const { member, link, isFocus, discipleCount } = data;
    return (
        <div style={{
            background: isFocus ? "linear-gradient(135deg,#F0FDF4,#DCFCE7)" : "#fff",
            border: `2px solid ${isFocus ? "#10B981" : selected ? "#10B981" : "#BBF7D0"}`,
            borderRadius: 12, padding: "10px 14px", width: 196,
            boxShadow: isFocus
                ? "0 0 0 4px #10B98120, 0 4px 16px rgba(16,185,129,0.15)"
                : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.2s",
cursor: "pointer",
        }}>
            <Handle type="target" position={Position.Top} style={{ background: "#10B981", width: 9, height: 9 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Avatar size={32} style={{ background: "linear-gradient(135deg,#10B981,#059669)", fontSize: 13, fontWeight: 700 }}>
                    {member?.name?.[0] || "?"}
                </Avatar>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{member?.name}</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>{member?.branch}</div>
                </div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <Tag color="green" style={{ fontSize: 10, margin: 0 }}>Môn đồ</Tag>
                {discipleCount > 0 && (
                    <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>👤 {discipleCount}</Tag>
                )}
                {link?.startMonth && (
                    <Tag style={{ fontSize: 9, margin: 0, background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B" }}>
                        {link.startMonth}→{link.endMonth}
                    </Tag>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: "#10B981", width: 9, height: 9 }} />
        </div>
    );
};
const nodeTypes: NodeTypes = {
    rootNode: RootNode,
    mentorNode: MentorNode,
    discipleNode: DiscipleNode,
};
// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function Diagram() {
    const [lang, setLang] = useState<"vi" | "en" | "ko">("vi");
    const t = T[lang];
    const [collapsed, setSidebarCollapsed] = useState(false);
    const [activeView, setActiveView] = useState<"diagram" | "admin" | "messages">("diagram");
    const [selectedCourse, setSelectedCourse] = useState("c1");
    const [currentUser] = useState(MEMBERS[0]); // m1 = admin
    const [focusMyself, setFocusMyself] = useState(false);
    // Modal state
    const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
    const [nodeModalOpen, setNodeModalOpen] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [msgs, setMsgs] = useState(MESSAGES_DATA);
    // Admin state
    const [courses, setCourses] = useState(COURSES);
    // React Flow
    const { nodes: initNodes, edges: initEdges } = useMemo(
        () => buildTreeForCourse(selectedCourse, focusMyself ? currentUser.id : undefined),
        [selectedCourse, focusMyself, currentUser.id]
    );
    const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
    const getDescendants = (
        memberId: string,
        courseId: string,
        level = 0
    ): Array<{
        member: any;
level: number;
        link: any;
    }> => {
        const links = TRAINING_LINKS.filter(
            l => l.courseId === courseId && l.mentorId === memberId
        );
        let result: any[] = [];
        links.forEach(link => {
            const member = MEMBERS.find(
                m => m.id === link.discipleId
            );
            if (!member) return;
            result.push({
                member,
                level,
                link,
            });
            result.push(
                ...getDescendants(
                    member.id,
                    courseId,
                    level + 1
                )
            );
        });
        return result;
    };
    useEffect(() => {
        const { nodes: n, edges: e } = buildTreeForCourse(selectedCourse, focusMyself ? currentUser.id : undefined);
        setNodes(n);
        setEdges(e);
    }, [selectedCourse, focusMyself]);
    const onConnect = useCallback(
        (p: Connection) => setEdges((eds) => addEdge({ ...p, animated: true, style: { stroke: "#6366F1", strokeWidth: 2 } }, eds)),
        []
    );
    const onNodeClick = useCallback((_: any, node: any) => {
        if (node.id === "root") return;
        setSelectedNodeData(node.data);
        setNodeModalOpen(true);
    }, []);
    // Course name helper
    const courseName = (id: string) => {
        const c = courses.find((c) => c.id === id);
        if (!c) return id;
        if (lang === "en") return (c as any).nameEn || c.name;
        if (lang === "ko") return (c as any).nameKo || c.name;
        return c.name;
    };
    const selectedMember = selectedNodeData?.member;
    const nodeMessages = msgs.filter(
        (m) => selectedMember && (m.fromId === selectedMember.id || m.toId === selectedMember.id)
    );
    const descendantTree = useMemo(() => {
        if (!selectedMember) return [];
        return getDescendants(
            selectedMember.id,
            selectedCourse
        );
    }, [selectedMember, selectedCourse]);
    const sendMessage = () => {
        if (!messageInput.trim() || !selectedMember) return;
        setMsgs([...msgs, {
            id: `msg${Date.now()}`, fromId: currentUser.id, toId: selectedMember.id,
            content: messageInput, time: new Date().toLocaleString(),
        }]);
        setMessageInput("");
        message.success("Thư tín đã gửi! Email thông báo đang được xử lý qua AWS SES.");
    };
    return (
        <div style={{ background: "#fdfeff", minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Be Vietnam Pro', 'DM Sans', sans-serif" }}>
            <div style={{ width: "100%", height: "90vh", minHeight: 580, background: "#ffffff", overflow: "hidden", display: "flex", flexDirection: "column", }}>
                <Layout >
                    {/* Header */}
<Header style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", height: 60, padding: "0 20px", display: "flex", alignItems: "center", gap: 12 }}>
                        {activeView === "diagram" && (
                            <>
                                <BookOutlined style={{ color: "#6366F1", fontSize: 16 }} />
                                <Select
                                    value={selectedCourse} onChange={setSelectedCourse}
                                    style={{ width: 240 }} size="middle"
                                    placeholder={t.selectCourse}
                                >
                                    {courses.map((c) => (
                                        <Option key={c.id} value={c.id}>{courseName(c.id)}</Option>
                                    ))}
                                </Select>
                                <Button
                                    type={focusMyself ? "primary" : "default"}
                                    size="middle" icon={<EyeOutlined />}
                                    onClick={() => setFocusMyself(!focusMyself)}
                                    style={focusMyself ? { background: "#6366F1", borderColor: "#6366F1" } : {}}
                                >
                                    {!collapsed && t.myDiagram}
                                </Button>
                            </>
                        )}
                    </Header>
                    <Content style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                            <ReactFlow
                                nodes={nodes} edges={edges}
                                onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                                onConnect={onConnect} onNodeClick={onNodeClick}
                                nodeTypes={nodeTypes}
                                fitView fitViewOptions={{ padding: 0.18 }}
                                defaultEdgeOptions={{ type: "smoothstep" }}
                                style={{ background: "#ffffff" }}
                                connectionLineStyle={{ stroke: "#6366F1", strokeWidth: 1.5 }}
                                snapToGrid snapGrid={[8, 8]}
                                minZoom={0.2} maxZoom={2.5}
                                proOptions={{ hideAttribution: true }}
                            >
                                <Background
                                    variant={BackgroundVariant.Lines}
                                    gap={10}
                                    color="#F1F5F9"
                                />
                                <Controls style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)", borderRadius: 10, border: "1px solid #E2E8F0" }} />
                                <MiniMap
nodeColor={(n) => n.type === "rootNode" ? "#0F172A" : n.type === "mentorNode" ? "#6366F1" : "#10B981"}
                                    style={{ borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff" }}
                                    maskColor="rgba(99,102,241,0.08)"
                                />
                                <Panel position="top-right">
                                    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "6px 12px", fontSize: 10, color: "#64748B", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 280 }}>
                                        💡 {t.dragZoom}
                                    </div>
                                </Panel>
                                {/* Legend */}
                                <Panel position="top-left">
                                    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", gap: 12 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#1E293B" }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#6366F1" }} />{t.mentor}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#1E293B" }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#10B981" }} />{t.disciple}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#1E293B" }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#0F172A" }} />{t.course}
                                        </div>
                                    </div>
                                </Panel>
                            </ReactFlow>
                        </div>
                    </Content>
                </Layout>
            </div>
            {/* ═══ NODE DETAIL MODAL ════════════════════════════════════════════════ */}
            <Drawer
  open={nodeModalOpen}
  onClose={() => setNodeModalOpen(false)}
  placement="right"
  closable={false}
  size="large"
  styles={{
    body: {
      padding: 0,
      background: '#F8FAFC',
      overflowX: 'hidden',
    },
  }}
>
                {selectedNodeData && (
                    <div >
                        {/* HEADER */}
                        <div
                            style={{
background: selectedNodeData.isMentor
                                    ? "linear-gradient(135deg,#6366F1,#8B5CF6)"
                                    : "linear-gradient(135deg,#10B981,#059669)",
                                padding: 24,
                                color: "#fff",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 14,
                                        alignItems: "center",
                                    }}
                                >
                                    <Avatar
                                        size={56}
                                        style={{
                                            background:
                                                "rgba(255,255,255,0.2)",
                                            border:
                                                "2px solid rgba(255,255,255,0.4)",
                                            fontSize: 22,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {selectedMember?.name?.[0]}
                                    </Avatar>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 18,
                                                fontWeight: 800,
                                            }}
                                        >
                                            {selectedMember?.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                opacity: 0.9,
                                            }}
                                        >
                                            {selectedMember?.branch}
                                        </div>
                                        <Tag
                                            style={{
                                                marginTop: 8,
                                                border: "none",
                                                color: "#fff",
                                                background:
"rgba(255,255,255,.2)",
                                            }}
                                        >
                                            {selectedNodeData.isMentor
                                                ? "👑 Người hướng dẫn"
                                                : "🌱 Môn đồ"}
                                        </Tag>
                                    </div>
                                </div>
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={() =>
                                        setNodeModalOpen(false)
                                    }
                                    style={{
                                        color: "#fff",
                                    }}
                                />
                            </div>
                        </div>
                        {/* BODY */}
                        <div
                            style={{
                                padding: 20,
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                            }}
                        >
                            {/* BASIC INFO */}
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: 14,
                                    padding: 16,
                                    border: "1px solid #E2E8F0",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        marginBottom: 12,
                                        color: "#0F172A",
                                    }}
                                >
                                    📋 Thông tin
                                </div>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(2,1fr)",
                                        gap: 10,
                                    }}
                                >
                                    {selectedNodeData.link && (
                                        <>
                                            <div
                                                style={{
                                                    background:
                                                        "#F8FAFC",
padding: 10,
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color:
                                                            "#94A3B8",
                                                    }}
                                                >
                                                    Bắt đầu
                                                </div>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {
                                                        selectedNodeData
                                                            .link
                                                            .startMonth
                                                    }
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    background:
                                                        "#F8FAFC",
                                                    padding: 10,
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color:
                                                            "#94A3B8",
                                                    }}
                                                >
                                                    Kết thúc
                                                </div>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {
                                                        selectedNodeData
                                                            .link
.endMonth
                                                    }
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div
                                        style={{
                                            background: "#F8FAFC",
                                            padding: 10,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "#94A3B8",
                                            }}
                                        >
                                            Email
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {selectedMember?.email}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            background: "#F8FAFC",
                                            padding: 10,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "#94A3B8",
                                            }}
                                        >
                                            Ngày sinh
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {selectedMember?.dob}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* DISCIPLE TREE */}
                            <div
                                style={{
                                    background: "#fff",
borderRadius: 14,
                                    padding: 16,
                                    border: "1px solid #E2E8F0",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        marginBottom: 12,
                                    }}
                                >
                                    🌳 Cây môn đồ trực thuộc
                                </div>
                                {descendantTree.length === 0 ? (
                                    <Empty
                                        image={
                                            Empty.PRESENTED_IMAGE_SIMPLE
                                        }
                                        description="Chưa có môn đồ bên dưới"
                                    />
                                ) : (
                                    <div
                                        style={{
                                            maxHeight: 280,
                                            overflowY: "auto",
                                        }}
                                    >
                                        {descendantTree.map(
                                            (item) => (
                                                <div
                                                    key={
                                                        item.member.id +
                                                        item.link.id
                                                    }
                                                    onClick={() => {
                                                        setSelectedNodeData(
                                                            {
                                                                member:
                                                                    item.member,
                                                                isMentor:
                                                                    TRAINING_LINKS.some(
                                                                        (
                                                                            l
                                                                        ) =>
                                                                            l.mentorId ===
                                                                            item
                                                                                .member
                                                                                .id
                                                                    ),
courseId:
                                                                    selectedCourse,
                                                            }
                                                        );
                                                    }}
                                                    style={{
                                                        marginLeft:
                                                            item.level *
                                                            24,
                                                        marginBottom: 8,
                                                        padding:
                                                            "10px 12px",
                                                        borderRadius: 12,
                                                        background:
                                                            "#F8FAFC",
                                                        border:
                                                            "1px solid #E2E8F0",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: 10,
                                                        cursor:
                                                            "pointer",
                                                        transition:
                                                            ".2s",
                                                    }}
                                                >
                                                    <Avatar
                                                        size={30}
                                                        style={{
                                                            background:
                                                                item.level ===
                                                                    0
                                                                    ? "#10B981"
                                                                    : "#6366F1",
                                                        }}
                                                    >
                                                        {
                                                            item
                                                                .member
                                                                .name[0]
                                                        }
                                                    </Avatar>
                                                    <div
style={{
                                                            flex: 1,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {
                                                                item
                                                                    .member
                                                                    .name
                                                            }
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color:
                                                                    "#64748B",
                                                            }}
                                                        >
                                                            {
                                                                item
                                                                    .member
                                                                    .branch
                                                            }
                                                        </div>
                                                    </div>
                                                    <Tag color="blue">
                                                        F
                                                        {item.level +
                                                            1}
                                                    </Tag>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* MENTOR STATS */}
                            {selectedNodeData.isMentor && (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: 14,
                                        padding: 16,
                                        border:
"1px solid #E2E8F0",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            marginBottom: 10,
                                        }}
                                    >
                                        📊 Thống kê đào tạo
                                    </div>
                                    {Object.entries(
                                        TRAINING_LINKS.filter(
                                            (l) =>
                                                l.mentorId ===
                                                selectedMember?.id
                                        ).reduce(
                                            (
                                                acc: Record<
                                                    string,
                                                    number
                                                >,
                                                l
                                            ) => {
                                                acc[
                                                    l.courseId
                                                ] =
                                                    (acc[
                                                        l
                                                            .courseId
                                                    ] || 0) +
                                                    1;
                                                return acc;
                                            },
                                            {}
                                        )
                                    ).map(([cid, cnt]) => (
                                        <div
                                            key={cid}
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <span>
                                                {courseName(
                                                    cid
                                                )}
                                            </span>
                                            <Tag color="geekblue">
                                                {cnt} môn đồ
</Tag>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* MESSAGE */}
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: 14,
                                    padding: 16,
                                    border: "1px solid #E2E8F0",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        marginBottom: 12,
                                    }}
                                >
                                    💬 Thư tín
                                </div>
                                <div
                                    style={{
                                        maxHeight: 220,
                                        overflowY: "auto",
                                        marginBottom: 12,
                                    }}
                                >
                                    {nodeMessages.map((m) => {
                                        const from =
                                            MEMBERS.find(
                                                (x) =>
                                                    x.id ===
                                                    m.fromId
                                            );
                                        return (
                                            <div
                                                key={m.id}
                                                style={{
                                                    marginBottom: 10,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color:
                                                            "#94A3B8",
                                                    }}
                                                >
                                                    {
                                                        from?.name
                                                    }
                                                </div>
                                                <div
                                                    style={{
                                                        background:
                                                            "#F8FAFC",
padding:
                                                            "8px 10px",
                                                        borderRadius: 8,
                                                        marginTop: 3,
                                                    }}
                                                >
                                                    {
                                                        m.content
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                    }}
                                >
                                    <Input
                                        value={messageInput}
                                        onChange={(e) =>
                                            setMessageInput(
                                                e.target.value
                                            )
                                        }
                                        onPressEnter={
                                            sendMessage
                                        }
                                        placeholder={
                                            t.messagePlaceholder
                                        }
                                    />
                                    <Button
                                        type="primary"
                                        icon={
                                            <SendOutlined />
                                        }
                                        onClick={
                                            sendMessage
                                        }
                                        style={{
                                            background:
                                                "#6366F1",
                                            borderColor:
                                                "#6366F1",
                                        }}
                                    >
                                        {t.send}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}