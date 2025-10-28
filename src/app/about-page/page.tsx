import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/landing-page-components/Header"
import { Footer } from "@/components/landing-page-components/Footer"
import { Play, Users, Target, Award, ArrowRight, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-16 pb-8 md:pt-24 md:pb-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center mt-6 space-x-2 bg-primary/10 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-4 md:mb-6">
              <Play className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">About Postsiva</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 px-2 sm:px-0 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Revolutionizing YouTube Content Creation
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
              We're on a mission to empower content creators with AI-driven tools that transform how videos are
              optimized, scheduled, and published on YouTube.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
            <Card className="p-5 sm:p-6 md:p-8 border-2 hover:border-primary/20 transition-colors">
              <CardContent className="p-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Our Mission</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  To democratize YouTube success by providing creators with intelligent automation tools that handle the
                  technical aspects of content optimization, allowing them to focus on what they do best - creating
                  amazing content.
                </p>
              </CardContent>
            </Card>

            <Card className="p-5 sm:p-6 md:p-8 border-2 hover:border-primary/20 transition-colors">
              <CardContent className="p-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Our Vision</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  To become the leading platform where every content creator, regardless of their technical expertise,
                  can leverage the power of AI to grow their YouTube channel and reach their full potential.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-8 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Our Story</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">How Postsiva came to life</p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-semibold mb-2">The Problem We Saw</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Content creators were spending countless hours on video optimization, title creation, and scheduling
                    - time that could be better spent on actual content creation. Many talented creators struggled to
                    grow because they lacked the technical knowledge for YouTube SEO.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-semibold mb-2">The Solution We Built</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    We combined cutting-edge AI technology with deep YouTube expertise to create an automation platform
                    that handles video optimization, generates compelling titles and descriptions, creates eye-catching
                    thumbnails, and manages publishing schedules.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-semibold mb-2">The Impact We're Making</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Today, thousands of creators use Postsiva to streamline their workflow, increase their video
                    performance, and grow their channels faster than ever before. We're proud to be part of their
                    success stories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Our Values</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">What drives us every day</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Creator-First</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Every feature we build is designed with creators in mind. We listen, learn, and iterate based on real
                creator needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Innovation</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                We're constantly pushing the boundaries of what's possible with AI and automation in content creation.
              </p>
            </div>

            <div className="text-center sm:col-span-1 md:col-span-1 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Excellence</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                We're committed to delivering the highest quality tools and support to help creators achieve their
                goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 px-2 sm:px-0">
              Ready to Transform Your YouTube Channel?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-2 sm:px-0">
              Join thousands of creators who are already using Postsiva to grow their channels faster and more
              efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/auth/signup" className="flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/feature-showcase">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
