import { Tooltip } from "antd";

export    const renderText = (value?: string | null) => (
    <Tooltip title={value}>
        <span>
            {value || '-'}
        </span>
    </Tooltip>
);