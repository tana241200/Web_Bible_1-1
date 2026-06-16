'use client';

import { Avatar, Card, Flex, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { MemberProfileRecord } from '@/types/member.types';

const { Text } = Typography;

type TreePersonCardProps = {
  member: MemberProfileRecord;
  active?: boolean;
  level?: number;
  onClick?: () => void;
};

export const TreePersonCard = ({
  member,
  active = false,
  level,
  onClick,
}: TreePersonCardProps) => {
  return (
    <Card
      hoverable={Boolean(onClick)}
      size="small"
      onClick={onClick}
      className={`
        rounded-xl
        transition-all
        duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${active ? 'border-green-500 bg-green-50' : ''}
      `}
      styles={{
        body: {
          padding: 12,
        },
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={12}>
          <Avatar
            size={44}
            icon={!member.fullName && <UserOutlined />}
            className={active ? 'bg-green-500' : 'bg-indigo-500'}
          >
            {member.fullName?.[0]}
          </Avatar>

          <Flex vertical gap={2}>
            <Text strong>{member.fullName}</Text>

            <Text type="secondary" className="text-xs">
              {member.branchName || '-'}
            </Text>
          </Flex>
        </Flex>

        {level !== undefined && (
          <Tag color="processing">
            F{level + 1}
          </Tag>
        )}
      </Flex>
    </Card>
  );
};