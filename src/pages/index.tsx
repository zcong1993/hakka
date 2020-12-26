import React from 'react'
import Link from 'next/link'
import { timeago } from '@src/lib/date'
import { Header } from '@src/components/Header'
import { Avatar } from '@src/components/Avatar'
import { NodeLabel } from '@src/components/NodeLabel'
import { MainLayout } from '@src/components/MainLayout'
import { GetServerSideProps } from 'next'
import { getServerSession } from '@server/lib/auth'
import { AuthUser } from '@server/lib/auth'
import { queryGraphql } from '@server/lib/graphql'
import {
  TopicsDocument,
  TopicsQuery,
  TopicsQueryVariables,
} from '@src/generated/graphql'
import { AuthProvider } from '@src/hooks/useAuth'
import Head from 'next/head'

type PageProps = {
  topicsQuery: TopicsQuery
  user: AuthUser | null
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  ctx,
) => {
  const { user } = await getServerSession(ctx.req)
  const topicsQuery = await queryGraphql<TopicsQuery, TopicsQueryVariables>(
    TopicsDocument,
    {
      page: 1,
    },
    { req: ctx.req, res: ctx.res, user },
  )
  return {
    props: {
      topicsQuery,
      user,
    },
  }
}

const HomePage: React.FC<PageProps> = ({ topicsQuery, user }) => {
  return (
    <AuthProvider value={user}>
      <Head>
        <title>HAKKA!</title>
      </Head>
      <Header />
      <MainLayout>
        <div className="bg-white shadow rounded-lg divide-y divide-gray-100">
          {topicsQuery.topics.items.map((item) => {
            return (
              <div key={item.id} className="">
                <div className="p-5">
                  <div className="flex space-x-3">
                    <Avatar
                      username={item.author.username}
                      avatar={item.author.avatar}
                    />
                    <div>
                      <h2 className="text-lg">
                        <Link href={`/t/${item.id}`}>
                          <a className="hover:text-red-700">{item.title}</a>
                        </Link>
                      </h2>
                      <div className="text-sm text-gray-400 mt-1">
                        <span>
                          <NodeLabel
                            name={item.node.name}
                            slug={item.node.slug}
                          />
                        </span>
                        <span className="ml-3">
                          <Link href={`/u/${item.author.username}`}>
                            <a>{item.author.username}</a>
                          </Link>
                        </span>
                        <span className="ml-3">{timeago(item.createdAt)}</span>
                        {item.commentsCount > 0 && (
                          <span className="mx-2 text-gray-300">•</span>
                        )}
                        {item.commentsCount > 0 && (
                          <span>{item.commentsCount} 条回复</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </MainLayout>
    </AuthProvider>
  )
}

export default HomePage