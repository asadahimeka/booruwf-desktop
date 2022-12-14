<template>
  <v-dialog
    v-model="store.showImageSelected"
    :content-class="scaleOn ? 'img_detail_scale_on' : ''"
    :width="imageSelectedWidth > 360 ? imageSelectedWidth : 360"
    :overlay-opacity="0.7"
  >
    <v-img
      v-if="store.showImageSelected"
      :src="imgSrc"
      :lazy-src="imgLasySrc"
      :aspect-ratio="imageSelected.aspectRatio"
      style="min-width: 300px;"
      @click="toggleToolbar"
      @error="onImageLoadError"
    >
      <template #placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular :size="100" :width="6" indeterminate color="deep-purple" />
        </v-row>
      </template>
      <v-toolbar
        v-show="showImageToolbar"
        style="position:absolute;top:0;width:100%;z-index:10;"
        color="transparent"
        height="auto"
        flat
      >
        <v-chip
          v-show="imageSelectedWidth > 400"
          small
          color="#ee8888b3"
          text-color="#ffffff"
          class="hidden-sm-and-down"
          @click.stop="toDetailPage"
          v-text="`${imageSelected.rating?.toUpperCase()} ${imageSelected.id}`"
        />
        <v-spacer />
        <!-- <v-tooltip v-if="store.isYKSite" bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              color="#ee8888b3"
              v-bind="attrs"
              class="mr-1"
              v-on="on"
              @click.stop="addFavorite"
            >
              <v-icon>{{ postDetail.voted ? mdiHeart : mdiHeartPlusOutline }}</v-icon>
            </v-btn>
          </template>
          <span>{{ postDetail.voted ? '已收藏' : '收藏' }}</span>
        </v-tooltip> -->
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              color="#ee8888b3"
              v-bind="attrs"
              class="mr-1"
              v-on="on"
              @click.stop="toDetailPage"
            >
              <v-icon>{{ mdiLinkVariant }}</v-icon>
            </v-btn>
          </template>
          <span>详情</span>
        </v-tooltip>
        <v-tooltip v-if="imageSelected.sourceUrl" bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              color="#ee8888b3"
              v-bind="attrs"
              class="mr-1"
              v-on="on"
              @click.stop="toSourcePage"
            >
              <v-icon>{{ mdiLaunch }}</v-icon>
            </v-btn>
          </template>
          <span>{{ `来源 ${imageSelected.sourceUrl}` }}</span>
        </v-tooltip>
        <v-tooltip v-if="!isVideo" bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              color="#ee8888b3"
              class="mr-1"
              v-bind="attrs"
              v-on="on"
              @click.stop="scaleOn = !scaleOn"
            >
              <v-icon>{{ scaleOn ? mdiMagnifyMinusOutline : mdiMagnifyPlusOutline }}</v-icon>
            </v-btn>
          </template>
          <span>{{ scaleOn ? '缩小' : '查看原图' }}</span>
        </v-tooltip>
        <v-menu dense open-on-hover offset-y>
          <template #activator="{ on, attrs }">
            <v-btn
              v-show="!downloading"
              fab
              dark
              small
              color="#ee8888b3"
              class="mr-1"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>{{ mdiDownload }}</v-icon>
            </v-btn>
          </template>
          <v-list dense flat>
            <v-list-item v-if="imageSelected.sampleUrl" two-line link dense>
              <v-list-item-content @click.stop="download(imageSelected.sampleUrl, imageSelected.sampleDownloadName)">
                <v-list-item-title>下载样品图</v-list-item-title>
                <v-list-item-subtitle v-text="imageSelected.sampleDownloadText" />
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="imageSelected.jpegUrl" two-line link dense>
              <v-list-item-content @click.stop="download(imageSelected.jpegUrl, imageSelected.jpegDownloadName)">
                <v-list-item-title>下载高清图</v-list-item-title>
                <v-list-item-subtitle v-text="imageSelected.jpegDownloadText" />
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line link dense>
              <v-list-item-content @click.stop="download(imageSelected.fileUrl, imageSelected.fileDownloadName)">
                <v-list-item-title>下载原文件</v-list-item-title>
                <v-list-item-subtitle v-text="imageSelected.fileDownloadText" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-progress-circular v-show="downloading" indeterminate class="ml-1 mr-2" color="#ee8888b3" />
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              color="#ee8888b3"
              class="mr-1"
              v-bind="attrs"
              v-on="on"
              @click.stop="addToList"
            >
              <v-icon>{{ mdiPlaylistPlus }}</v-icon>
            </v-btn>
          </template>
          <span>加入下载列表</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn fab dark small color="#ee8888b3" v-bind="attrs" v-on="on" @click.stop="close">
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
          </template>
          <span>关闭</span>
        </v-tooltip>
      </v-toolbar>
      <DPlayer v-if="isVideo" style="width: 100%;" :options="{ theme: '#ee8888', autoplay: true, video: { url: imageSelected.fileUrl } }" />
      <!-- <video v-if="isVideo" controls style="width: 100%;" :src="imageSelected.fileUrl ?? void 0"></video> -->
      <div v-show="!isVideo" class="img_scale_scroll">
        <img :src="scaleOn ? (imageSelected.jpegUrl || imageSelected.fileUrl || void 0) : void 0" alt="">
      </div>
      <div v-show="!isVideo && showImageToolbar">
        <div style="position: absolute;bottom: 12px;padding: 0 12px;">
          <v-chip
            v-show="postDetail.tags?.length"
            small
            class="mr-1"
            color="#ee8888b3"
            text-color="#ffffff"
            @click.stop="toggleTagsShow()"
          >
            <v-icon left>{{ mdiTagMultiple }}</v-icon>
            <span>{{ showTagChipGroup ? '隐藏' : '显示' }}</span>
          </v-chip>
          <v-chip-group v-show="showTagChipGroup" column>
            <v-chip
              v-for="(item, i) in postDetail.tags || []"
              :key="i"
              small
              class="mr-1"
              :color="item.color"
              text-color="#ffffff"
              @click.stop="toTagsPage(item.tag)"
              v-text="item.tagText"
            />
          </v-chip-group>
        </div>
        <v-btn fab dark small color="#ee888863" class="poa_left_center" @click.stop="showPrevPost">
          <v-icon>{{ mdiChevronLeft }}</v-icon>
        </v-btn>
        <v-btn fab dark small color="#ee888863" class="poa_right_center" @click.stop="showNextPost">
          <v-icon>{{ mdiChevronRight }}</v-icon>
        </v-btn>
      </div>
    </v-img>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiDownload,
  // mdiHeart,
  // mdiHeartPlusOutline,
  mdiLaunch,
  mdiLinkVariant,
  mdiMagnifyMinusOutline,
  mdiMagnifyPlusOutline,
  mdiPlaylistPlus,
  mdiTagMultiple,
} from '@mdi/js'
import { computed, onMounted, ref, watch } from '@vue/composition-api'
import DPlayer from './DPlayer.vue'
import { downloadFile, isURL, showMsg } from '@/utils'
import { type PostDetail, /* addPostToFavorites, */ getPostDetail } from '@/api/moebooru'
import store from '@/store'
import { getCurrSite } from '@/api/booru'

const showImageToolbar = ref(true)
const innerWidth = ref(window.innerWidth)
const innerHeight = ref(window.innerHeight)
const downloading = ref(false)
const scaleOn = ref(false)
const showTagChipGroup = ref(localStorage.getItem('__showTags') == '1')

const toggleTagsShow = () => {
  showTagChipGroup.value = !showTagChipGroup.value
  localStorage.setItem('__showTags', showTagChipGroup.value ? '1' : '')
}

const imageSelected = computed(() => store.imageList[store.imageSelectedIndex] ?? {})
const isVideo = computed(() => ['.mp4', '.webm'].some(e => imageSelected.value.fileUrl?.endsWith(e)))
const imgSrc = computed(() => {
  if (isVideo.value) return void 0
  return imageSelected.value.sampleUrl
    ?? imageSelected.value.fileUrl
    ?? void 0
})
const imgLasySrc = computed(() => {
  if (isVideo.value) return void 0
  return imageSelected.value.previewUrl ?? void 0
})

const imageSelectedWidth = computed(() => {
  const width = Number.parseInt(
    Math.min(
      innerWidth.value * 0.9,
      imageSelected.value.sampleWidth || innerWidth.value,
    ).toString(),
  )
  const height = Math.min(innerHeight.value * 0.9, imageSelected.value.sampleHeight || innerHeight.value)
  const width2 = Number.parseInt((height * imageSelected.value.aspectRatio).toString())
  return Math.min(width, width2)
})

const toggleToolbar = () => {
  showImageToolbar.value = !showImageToolbar.value
}

const host = ref(getCurrSite())

const toTagsPage = (tag: string) => {
  if (!store.isYKSite) return
  window.open(`https://${host.value}/post?tags=${tag}`, '_blank', 'noreferrer')
}

const toDetailPage = () => {
  window.open(imageSelected.value.postView, '_blank', 'noreferrer')
}

const toSourcePage = () => {
  const { sourceUrl } = imageSelected.value
  if (!isURL(sourceUrl)) return
  window.open(sourceUrl, '_blank', 'noreferrer')
}

const download = async (url: string | null, name: string) => {
  if (!url) return
  try {
    downloading.value = true
    await downloadFile(url, name)
  } catch (error) {
    showMsg({ msg: `下载出错: ${error}`, type: 'error' })
  } finally {
    downloading.value = false
  }
}

const addToList = () => {
  store.addToSelectedList(imageSelected.value)
}

const close = () => {
  store.showImageSelected = false
}

const postDetail = ref<PostDetail>({})

// const addFavorite = async () => {
//   if (notYKSite.value || postDetail.value.voted) return
//   const isSuccess = await addPostToFavorites(imageSelected.value.id)
//   if (isSuccess) postDetail.value.voted = true
// }

const setPostDetail = async () => {
  if (store.isYKSite) {
    const result = await getPostDetail(imageSelected.value.id)
    if (result) postDetail.value = result
  } else {
    postDetail.value = {
      voted: false,
      tags: imageSelected.value.tags.map(e => ({
        tag: e,
        tagText: e,
        color: '#E87A90cc',
        type: 'general',
      })),
    }
  }
}

const showPrevPost = async () => {
  if (store.imageSelectedIndex == 0) return
  store.imageSelectedIndex--
  await setPostDetail()
}

const showNextPost = async () => {
  if (store.imageSelectedIndex > store.imageList.length - 1) return
  store.imageSelectedIndex++
  await setPostDetail()
}

const onImageLoadError = () => {
  imageSelected.value.sampleUrl = null
}

watch(() => store.showImageSelected, async val => {
  if (!val) {
    scaleOn.value = false
    postDetail.value = {}
  } else {
    await setPostDetail()
  }
})

onMounted(() => {
  window.addEventListener('resize', () => {
    innerWidth.value = window.innerWidth
    innerHeight.value = window.innerHeight
  })
})
</script>
